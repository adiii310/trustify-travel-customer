/**
 * The one function that talks to the network.
 *
 * Responsibilities, and nothing else:
 *   1. Build the URL and the JSON body.
 *   2. Unwrap the `{ success, statusCode, message, data }` envelope.
 *   3. Turn every failure — network, HTTP, malformed — into an `ApiError`.
 *   4. Publish `RateLimit-*` headers to whoever is listening.
 *
 * It knows nothing about React, TanStack Query or Zustand, which keeps it
 * usable from server components, route handlers and plain scripts.
 */

import {
  API_BASE_URL,
  MAX_REQUEST_BYTES,
  REQUEST_TIMEOUT_MS,
} from "./config";
import { ApiError } from "./errors";
import type { ApiEnvelope, ApiFieldError, RateLimitSnapshot } from "./types";

type HttpMethod = "GET" | "POST";

/* ------------------------------------------------------------------ *
 * Rate-limit broadcasting
 *
 * The client cannot import the Zustand store (that would drag React into a
 * server-safe module and create a cycle), so it publishes snapshots instead
 * and lets interested modules subscribe. See `src/store/rateLimitStore.ts`.
 * ------------------------------------------------------------------ */

type RateLimitListener = (snapshot: RateLimitSnapshot) => void;

const rateLimitListeners = new Set<RateLimitListener>();

/** Subscribe to `RateLimit-*` headers. Returns an unsubscribe function. */
export function onRateLimit(listener: RateLimitListener): () => void {
  rateLimitListeners.add(listener);
  return () => rateLimitListeners.delete(listener);
}

/**
 * Read the standard rate-limit headers. Returns `null` when they are absent,
 * which is the case on every read endpoint — only submissions are limited.
 */
function readRateLimit(headers: Headers): RateLimitSnapshot | null {
  const limit = Number(headers.get("RateLimit-Limit"));
  const remaining = Number(headers.get("RateLimit-Remaining"));
  const resetSeconds = Number(headers.get("RateLimit-Reset"));

  if (!Number.isFinite(limit) || !Number.isFinite(remaining)) return null;

  return {
    limit,
    remaining,
    resetSeconds: Number.isFinite(resetSeconds) ? resetSeconds : 0,
    readAt: Date.now(),
  };
}

/* ------------------------------------------------------------------ *
 * Request
 * ------------------------------------------------------------------ */

/**
 * Perform one API call and return the unwrapped `data` payload.
 *
 * @throws {ApiError} on any non-2xx response, network failure or unreadable body.
 */
export async function request<TData>(
  method: HttpMethod,
  path: string,
  body?: unknown
): Promise<TData> {
  const url = `${API_BASE_URL}${path}`;

  // Serialise up front so we can reject an oversized body before spending a
  // round trip on a guaranteed 400.
  let serialised: string | undefined;
  if (body !== undefined) {
    serialised = JSON.stringify(body);
    if (new Blob([serialised]).size > MAX_REQUEST_BYTES) {
      throw new ApiError(
        "That is too much text to send at once. Please shorten it and try again.",
        { status: 400, kind: "http" }
      );
    }
  }

  // `AbortSignal.timeout` keeps a hung connection from leaving a form spinner
  // running forever.
  const signal =
    typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
      ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      : undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      // Only send a content type when there is a body, matching the reference
      // client in api.md. These endpoints use no cookies, so credentials are
      // deliberately left at the default ("same-origin") — never "include".
      headers: serialised ? { "Content-Type": "application/json" } : undefined,
      body: serialised,
      signal,
    });
  } catch (cause) {
    // A CORS rejection also lands here: the browser blocks the response before
    // our code sees a status, so there is never a status code to report.
    throw new ApiError("Could not reach the server.", {
      status: 0,
      kind: "network",
      cause,
    });
  }

  // Publish the rate-limit budget even on failures — a 429 response carries the
  // headers that tell us when the window resets.
  const snapshot = readRateLimit(response.headers);
  if (snapshot) {
    for (const listener of rateLimitListeners) listener(snapshot);
  }

  // A 404 on an unknown route can come back as HTML, so never assume JSON.
  const envelope = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<TData> | null;

  if (!response.ok) {
    const failure = envelope && envelope.success === false ? envelope : null;
    throw new ApiError(
      failure?.message ?? `Request failed with status ${response.status}`,
      {
        status: response.status,
        kind: "http",
        fieldErrors: (failure?.errors ?? []) as ApiFieldError[],
      }
    );
  }

  if (!envelope || envelope.success !== true) {
    throw new ApiError("The server returned an unexpected response.", {
      status: response.status,
      kind: "malformed",
    });
  }

  return envelope.data;
}

/** `GET` helper with optional query parameters; `undefined` values are dropped. */
export function get<TData>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<TData> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return request<TData>("GET", query ? `${path}?${query}` : path);
}

/** `POST` helper. */
export function post<TData>(path: string, body: unknown): Promise<TData> {
  return request<TData>("POST", path, body);
}
