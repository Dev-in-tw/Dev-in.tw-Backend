import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserPublic } from "./schemas/user.schema";
import { UserService } from "./user.service";

@ApiTags("user")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("info")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getInfo(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ accountData: UserPublic & { _id: string } }> {
    const account = await this.userService.readById(user.sub);

    if (!account) {
      throw new UnauthorizedException("User not found");
    }

    return { accountData: { ...account, _id: account.id } };
  }
}
