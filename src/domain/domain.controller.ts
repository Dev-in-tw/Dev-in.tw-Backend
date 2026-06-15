import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CloudflareRecord } from "../cloudflare/dto/cloudflare-record.dto";
import { DomainCheckResult, DomainService } from "./domain.service";
import { CheckDomainDto } from "./dto/check-domain.dto";
import { CreateDomainDto } from "./dto/create-domain.dto";
import { DnsRecordDto, UpdateDnsRecordDto } from "./dto/dns-record.dto";
import { DomainPublic } from "./schemas/domain.schema";

@ApiTags("domain")
@Controller("domain")
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get("check")
  async check(@Query() query: CheckDomainDto): Promise<DomainCheckResult> {
    return this.domainService.checkAvailable(query.name);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async register(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDomainDto,
  ): Promise<DomainPublic> {
    return this.domainService.register(user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async list(@CurrentUser() user: JwtPayload): Promise<DomainPublic[]> {
    return this.domainService.listByOwner(user.sub);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
  ): Promise<{ id: string }> {
    return this.domainService.remove(user.sub, id);
  }

  @Get(":id/dns")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async listDns(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
  ): Promise<CloudflareRecord[]> {
    return this.domainService.listDns(user.sub, id);
  }

  @Post(":id/dns")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createDns(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: DnsRecordDto,
  ): Promise<CloudflareRecord> {
    return this.domainService.createDns(user.sub, id, dto);
  }

  @Patch(":id/dns/:recordId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateDns(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Param("recordId") recordId: string,
    @Body() dto: UpdateDnsRecordDto,
  ): Promise<CloudflareRecord> {
    return this.domainService.updateDns(user.sub, id, recordId, dto);
  }

  @Delete(":id/dns/:recordId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteDns(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Param("recordId") recordId: string,
  ): Promise<{ id: string }> {
    return this.domainService.deleteDns(user.sub, id, recordId);
  }
}
