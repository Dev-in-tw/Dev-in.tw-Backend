import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CloudflareService } from "../cloudflare/cloudflare.service";
import { CloudflareRecord } from "../cloudflare/dto/cloudflare-record.dto";
import { UserService } from "../user/user.service";
import {
  RESERVED_SUBDOMAINS,
  SUBDOMAIN_REGEX,
} from "./constants/reserved-names";
import { CreateDomainDto } from "./dto/create-domain.dto";
import { DnsRecordDto, UpdateDnsRecordDto } from "./dto/dns-record.dto";
import {
  Domain,
  DomainDocument,
  DomainLean,
  DomainPublic,
} from "./schemas/domain.schema";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const E11000_DUPLICATE = 11000;

export interface DomainCheckResult {
  available: boolean;
  reason?: string;
}

@Injectable()
export class DomainService {
  private readonly rootDomain: string;

  constructor(
    @InjectModel(Domain.name)
    private readonly domainModel: Model<DomainDocument>,
    private readonly cloudflare: CloudflareService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.rootDomain = this.configService.getOrThrow<string>("ROOT_DOMAIN");
  }

  /**
   * Decides whether a subdomain label may be registered: format, reserved-word
   * blacklist, then DB uniqueness. The DB check is best-effort — the unique
   * index in `register` is the real race-safe guarantee.
   */
  async checkAvailable(name: string): Promise<DomainCheckResult> {
    const normalised = name.toLowerCase();

    if (!SUBDOMAIN_REGEX.test(normalised)) {
      return { available: false, reason: "Invalid subdomain format" };
    }

    if (RESERVED_SUBDOMAINS.has(normalised)) {
      return { available: false, reason: "This name is reserved" };
    }

    const exists = await this.domainModel.exists({ name: normalised });
    if (exists) {
      return { available: false, reason: "This name is already taken" };
    }

    return { available: true };
  }

  /**
   * Registers a subdomain for the owner: re-checks availability, persists the
   * registrant's identity fields onto the user, then creates the domain as
   * immediately active. A concurrent duplicate is caught via the unique index.
   */
  async register(ownerId: string, dto: CreateDomainDto): Promise<DomainPublic> {
    const name = dto.name.toLowerCase();

    const availability = await this.checkAvailable(name);
    if (!availability.available) {
      throw new ConflictException(
        availability.reason ?? "This name is not available",
      );
    }

    await this.userService.editById(ownerId, {
      first_name: dto.first_name,
      last_name: dto.last_name,
      birth: dto.birth,
      identy_id: dto.identy_id,
      address: dto.address,
      phone: dto.phone,
    });

    const now = new Date();

    try {
      const created = await this.domainModel.create({
        name,
        description: dto.description ?? "",
        owner: ownerId,
        verify: true,
        status: "active",
        apply_time: now,
        last_update: now,
        expire_time: new Date(now.getTime() + ONE_YEAR_MS),
      });

      return this.toPublic(
        created.toObject() as unknown as DomainLean,
      ) as DomainPublic;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException("This name is already taken");
      }
      throw error;
    }
  }

  async listByOwner(ownerId: string): Promise<DomainPublic[]> {
    const docs = await this.domainModel
      .find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .lean<DomainLean[]>()
      .exec();

    return docs.map((doc) => this.toPublic(doc) as DomainPublic);
  }

  /**
   * Deletes a domain the caller owns, first removing every Cloudflare DNS record
   * scoped under it so no orphaned records linger in the zone.
   */
  async remove(ownerId: string, domainId: string): Promise<{ id: string }> {
    const domain = await this.assertOwnedDomain(ownerId, domainId);

    const records = await this.cloudflare.listRecords({
      nameEndsWith: `${domain.name}.${this.rootDomain}`,
    });

    for (const record of records) {
      if (this.isRecordInScope(record.name, domain.name)) {
        await this.cloudflare.deleteRecord(record.id);
      }
    }

    await this.domainModel.deleteOne({ _id: domain.id }).exec();

    return { id: domain.id };
  }

  /**
   * Lists DNS records for the owner's domain. `name.endswith` is *not* a
   * security boundary, so the result is filtered again with the same in-scope
   * predicate before returning.
   */
  async listDns(
    ownerId: string,
    domainId: string,
  ): Promise<CloudflareRecord[]> {
    const domain = await this.assertOwnedDomain(ownerId, domainId);

    const records = await this.cloudflare.listRecords({
      nameEndsWith: `${domain.name}.${this.rootDomain}`,
    });

    return records.filter((record) =>
      this.isRecordInScope(record.name, domain.name),
    );
  }

  async createDns(
    ownerId: string,
    domainId: string,
    dto: DnsRecordDto,
  ): Promise<CloudflareRecord> {
    const domain = await this.assertOwnedDomain(ownerId, domainId);
    this.assertRecordInScope(dto.name, domain.name);

    return this.cloudflare.createRecord({
      type: dto.type,
      name: dto.name,
      content: dto.content,
      ttl: dto.ttl,
      proxied: dto.proxied,
      comment: dto.comment,
    });
  }

  /**
   * Updates a DNS record. The record's *current* name is fetched from Cloudflare
   * and scope-checked — never the client-supplied id/name. If the update changes
   * the name, the new name is scope-checked too.
   */
  async updateDns(
    ownerId: string,
    domainId: string,
    recordId: string,
    dto: UpdateDnsRecordDto,
  ): Promise<CloudflareRecord> {
    const domain = await this.assertOwnedDomain(ownerId, domainId);

    const existing = await this.cloudflare.getRecord(recordId);
    this.assertRecordInScope(existing.name, domain.name);

    if (dto.name !== undefined) {
      this.assertRecordInScope(dto.name, domain.name);
    }

    return this.cloudflare.updateRecord(recordId, {
      type: dto.type,
      name: dto.name,
      content: dto.content,
      ttl: dto.ttl,
      proxied: dto.proxied,
      comment: dto.comment,
    });
  }

  /**
   * Deletes a DNS record after confirming its real name (from Cloudflare) falls
   * within the owner's subdomain scope.
   */
  async deleteDns(
    ownerId: string,
    domainId: string,
    recordId: string,
  ): Promise<{ id: string }> {
    const domain = await this.assertOwnedDomain(ownerId, domainId);

    const existing = await this.cloudflare.getRecord(recordId);
    this.assertRecordInScope(existing.name, domain.name);

    return this.cloudflare.deleteRecord(recordId);
  }

  /**
   * SECURITY CORE — resolves the domain by id and verifies the caller owns it.
   * Throws 404 if it does not exist, 403 if it belongs to someone else.
   */
  private async assertOwnedDomain(
    ownerId: string,
    domainId: string,
  ): Promise<DomainPublic> {
    const doc = await this.domainModel
      .findById(domainId)
      .lean<DomainLean>()
      .exec();

    if (!doc) {
      throw new NotFoundException("Domain not found");
    }

    if (doc.owner !== ownerId) {
      throw new ForbiddenException("You do not own this domain");
    }

    return this.toPublic(doc) as DomainPublic;
  }

  /**
   * SECURITY CORE — verifies a DNS record name belongs to `<sub>.<root>` or a
   * descendant. The leading dot in the suffix is mandatory: without it
   * `evil-<sub>.<root>` would wrongly pass.
   */
  private assertRecordInScope(recordName: string, sub: string): void {
    if (!this.isRecordInScope(recordName, sub)) {
      throw new ForbiddenException(
        "DNS record is outside the allowed subdomain scope",
      );
    }
  }

  /** Pure predicate behind `assertRecordInScope`, reused for list filtering. */
  private isRecordInScope(recordName: string, sub: string): boolean {
    const fqdn = recordName.toLowerCase().replace(/\.$/, "");
    const base = `${sub}.${this.rootDomain}`;
    return fqdn === base || fqdn.endsWith(`.${base}`);
  }

  /** Detects Mongo's E11000 duplicate-key error from a unique index clash. */
  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: number }).code === E11000_DUPLICATE
    );
  }

  /** Normalises a lean document to the public shape (`id` instead of `_id`/`__v`). */
  private toPublic(doc: DomainLean | null): DomainPublic | null {
    if (!doc) {
      return null;
    }

    const { _id, ...rest } = doc;
    const result = { id: _id.toString(), ...rest } as DomainPublic & {
      __v?: number;
    };
    result.__v = undefined;

    return result;
  }
}
