import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

import {
  CloudflareEnvelope,
  CloudflareRecord,
  CloudflareRecordCreate,
  CloudflareRecordUpdate,
  ListRecordsParams,
} from "./dto/cloudflare-record.dto";

const CLOUDFLARE_BASE_URL = "https://api.cloudflare.com/client/v4";

/**
 * Thin wrapper over the Cloudflare DNS API. Owns a single axios instance
 * authenticated with the scoped API token and pinned to the configured zone.
 * Every call goes through `unwrap`, which turns Cloudflare's `{ success, errors,
 * result }` envelope (and transport failures) into a 502 BadGatewayException
 * whose message forwards Cloudflare's own error text to the client.
 */
@Injectable()
export class CloudflareService {
  private readonly http: AxiosInstance;
  private readonly zoneId: string;

  constructor(private readonly configService: ConfigService) {
    const apiToken = this.configService.getOrThrow<string>(
      "CLOUDFLARE_API_TOKEN",
    );
    this.zoneId = this.configService.getOrThrow<string>("CLOUDFLARE_ZONE_ID");

    this.http = axios.create({
      baseURL: CLOUDFLARE_BASE_URL,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    });
  }

  async listRecords(params: ListRecordsParams): Promise<CloudflareRecord[]> {
    return this.unwrap(
      this.http.get<CloudflareEnvelope<CloudflareRecord[]>>(
        `/zones/${this.zoneId}/dns_records`,
        {
          params: {
            "name.endswith": params.nameEndsWith,
            type: params.type,
            per_page: 100,
          },
        },
      ),
    );
  }

  async getRecord(id: string): Promise<CloudflareRecord> {
    return this.unwrap(
      this.http.get<CloudflareEnvelope<CloudflareRecord>>(
        `/zones/${this.zoneId}/dns_records/${id}`,
      ),
    );
  }

  async createRecord(dto: CloudflareRecordCreate): Promise<CloudflareRecord> {
    return this.unwrap(
      this.http.post<CloudflareEnvelope<CloudflareRecord>>(
        `/zones/${this.zoneId}/dns_records`,
        dto,
      ),
    );
  }

  async updateRecord(
    id: string,
    dto: CloudflareRecordUpdate,
  ): Promise<CloudflareRecord> {
    return this.unwrap(
      this.http.patch<CloudflareEnvelope<CloudflareRecord>>(
        `/zones/${this.zoneId}/dns_records/${id}`,
        dto,
      ),
    );
  }

  async deleteRecord(id: string): Promise<{ id: string }> {
    return this.unwrap(
      this.http.delete<CloudflareEnvelope<{ id: string }>>(
        `/zones/${this.zoneId}/dns_records/${id}`,
      ),
    );
  }

  /**
   * Awaits a Cloudflare request and normalises both the HTTP-level failures and
   * the envelope-level `success: false` case into a single BadGatewayException.
   * The exception message forwards Cloudflare's own error text so the frontend
   * can surface a meaningful reason.
   */
  private async unwrap<T>(
    request: Promise<{ data: CloudflareEnvelope<T> }>,
  ): Promise<T> {
    try {
      const { data } = await request;

      if (!data.success) {
        throw new BadGatewayException(this.messagesFrom(data.errors));
      }

      return data.result;
    } catch (error) {
      // Re-throw the explicit envelope failure untouched.
      if (error instanceof BadGatewayException) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const envelope = error.response?.data as
          | CloudflareEnvelope<unknown>
          | undefined;
        const messages = this.messagesFrom(envelope?.errors);
        throw new BadGatewayException(
          messages.length > 0 ? messages : "Cloudflare request failed",
        );
      }

      throw new BadGatewayException("Cloudflare request failed");
    }
  }

  /** Extracts human-readable messages from Cloudflare's error array. */
  private messagesFrom(
    errors: { code: number; message: string }[] | undefined,
  ): string[] {
    if (!errors || errors.length === 0) {
      return [];
    }
    return errors.map((error) => error.message);
  }
}
