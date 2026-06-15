import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  User,
  UserDocument,
  UserLean,
  UserPublic,
  UserWrite,
} from "./schemas/user.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async readById(id: string): Promise<UserPublic | null> {
    return this.toPublic(
      await this.userModel.findById(id).lean<UserLean>().exec(),
    );
  }

  async createNew(data: UserWrite): Promise<UserPublic> {
    const created = await this.userModel.create(data);
    // timestamps add createdAt/updatedAt at runtime; toObject()'s type omits them.
    return this.toPublic(
      created.toObject() as unknown as UserLean,
    ) as UserPublic;
  }

  async editById(id: string, data: UserWrite): Promise<UserPublic | null> {
    return this.toPublic(
      await this.userModel
        .findByIdAndUpdate(id, data, { new: true })
        .lean<UserLean>()
        .exec(),
    );
  }

  async upsertById(id: string, data: UserWrite): Promise<UserPublic | null> {
    return this.toPublic(
      await this.userModel
        .findByIdAndUpdate(id, data, { new: true, upsert: true })
        .lean<UserLean>()
        .exec(),
    );
  }

  /**
   * Creates the user on first GitHub login or updates the existing one, keyed by
   * the immutable `githubId`. The `githubId` unique index makes concurrent first
   * logins converge to a single document.
   */
  async upsertByGithubId(
    githubId: string,
    data: UserWrite,
  ): Promise<UserPublic> {
    return this.toPublic(
      await this.userModel
        .findOneAndUpdate(
          { githubId },
          { $set: data },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean<UserLean>()
        .exec(),
    ) as UserPublic;
  }

  /** Normalises a lean document to the public shape (`id` instead of `_id`/`__v`). */
  private toPublic(doc: UserLean | null): UserPublic | null {
    if (!doc) {
      return null;
    }

    const { _id, ...rest } = doc;
    const result = { id: _id.toString(), ...rest } as UserPublic & {
      __v?: number;
    };
    result.__v = undefined;

    return result;
  }
}
