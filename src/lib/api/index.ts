/**
 * Public surface of the API layer.
 *
 *   config.ts     base URL, limits, timeouts
 *   types.ts      wire types — a 1:1 mirror of api.md
 *   errors.ts     ApiError + user-facing message mapping
 *   client.ts     the only module that calls fetch
 *   endpoints.ts  one typed function per endpoint
 *   mappers.ts    wire shape → domain model
 *
 * Import from `@/lib/api` rather than reaching into individual files.
 */

export * from "./config";
export * from "./endpoints";
export * from "./errors";
export * from "./mappers";
export * from "./types";
export { onRateLimit } from "./client";
