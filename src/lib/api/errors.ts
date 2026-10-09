/**
 * A single error type for every way an API call can fail, so callers have one
 * thing to catch and one set of flags to branch on.
 */

import type { ApiFieldError } from "./types";

/** How the request failed, when the distinction changes what the UI should say. */
export type ApiErrorKind =
  /** The request never reached the server: offline, DNS, CORS, or aborted. */
  | "network"
  /** The server answered, but with a non-2xx status. */
  | "http"
  /** The server answered 2xx with a body we could not read as the envelope. */
  | "malformed";

export class ApiError extends Error {
  /** HTTP status, or `0` when the request never got a response. */
  readonly status: number;
  readonly kind: ApiErrorKind;
  /** Per-field messages from a 400. Empty for every other failure. */
  readonly fieldErrors: ApiFieldError[];
  /** True on 429 — the shared 20-per-10-minutes submission budget is spent. */
  readonly rateLimited: boolean;

  constructor(
    message: string,
    options: {
      status?: number;
      kind?: ApiErrorKind;
      fieldErrors?: ApiFieldError[];
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.kind = options.kind ?? "http";
    this.fieldErrors = options.fieldErrors ?? [];
    this.rateLimited = this.status === 429;
  }

  /** A 400 — validation failed, malformed JSON, or a body over 100 KB. */
  get isValidation(): boolean {
    return this.status === 400;
  }

  /** A 500 — the message is generic by design; details are logged server-side. */
  get isServer(): boolean {
    return this.status >= 500;
  }

  /**
   * Field errors keyed by field name, ready to drop into form state.
   * Later entries win if the server ever repeats a field.
   */
  get fieldErrorMap(): Record<string, string> {
    return Object.fromEntries(
      this.fieldErrors.map((e) => [e.field, e.message])
    );
  }
}

/** Narrowing helper — `unknown` from a `catch` block is the usual input. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * The single place that decides what a user sees when a request fails.
 *
 * The API's own `message` is always safe to display, so we prefer it and only
 * substitute our own copy where the server message would be unhelpful (network
 * failures, which never reach the server, and 500s, which are deliberately
 * generic).
 */
export function toUserMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "Something went wrong. Please try again.";
  }

  switch (true) {
    case error.kind === "network":
      return "Could not reach the server. Check your connection and try again.";
    case error.rateLimited:
      return "Too many submissions from this network. Please try again in a few minutes.";
    case error.isServer:
      return "Something went wrong at our end. Please try again shortly.";
    default:
      return error.message;
  }
}
