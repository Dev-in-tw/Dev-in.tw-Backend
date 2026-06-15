import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { FlattenMaps, HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

// `collection: "user"` keeps the existing collection name (the default would
// pluralise the class name to "users" and silently point at an empty collection).
@Schema({ timestamps: true, collection: "user" })
export class User {
  @Prop()
  githubId: string;

  @Prop()
  email: string;

  @Prop()
  name: string;

  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  birth: string;

  @Prop()
  avatar: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  badge: string[];

  @Prop()
  beta: boolean;

  @Prop()
  warn: number;

  @Prop()
  disabled: boolean;

  @Prop()
  premium: boolean;

  // `timestamps: true` adds createdAt / updatedAt automatically.
}

export const UserSchema = SchemaFactory.createForClass(User);

/** Shape accepted by write operations (every field optional, no timestamps). */
export type UserWrite = Partial<User>;

/** Raw shape returned by a `.lean()` query (still carries `_id`). */
export type UserLean = FlattenMaps<User> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

/** Public shape returned by the service: `_id`/`__v` normalised to `id`. */
export type UserPublic = Omit<UserLean, "_id"> & { id: string };
