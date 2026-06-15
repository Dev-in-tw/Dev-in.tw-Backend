/**
 * Cloudflare DNS record shapes and the standard response envelope returned by
 * `https://api.cloudflare.com/client/v4`. We only model the fields the app
 * actually reads/writes; Cloudflare returns more.
 */

/** A single DNS record as returned by Cloudflare. */
export interface CloudflareRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied?: boolean;
  comment?: string;
  zone_id?: string;
  zone_name?: string;
  created_on?: string;
  modified_on?: string;
}

/** Body accepted when creating a DNS record (POST). */
export interface CloudflareRecordCreate {
  type: string;
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
  comment?: string;
}

/** Body accepted when patching a DNS record (PATCH) — all fields optional. */
export type CloudflareRecordUpdate = Partial<CloudflareRecordCreate>;

/** One entry in the Cloudflare error/message arrays. */
export interface CloudflareMessage {
  code: number;
  message: string;
}

/** The standard envelope every Cloudflare v4 endpoint wraps its result in. */
export interface CloudflareEnvelope<T> {
  success: boolean;
  errors: CloudflareMessage[];
  messages: CloudflareMessage[];
  result: T;
  result_info?: unknown;
}

/** Parameters accepted by `CloudflareService.listRecords`. */
export interface ListRecordsParams {
  nameEndsWith: string;
  type?: string;
}
