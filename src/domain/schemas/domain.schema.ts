import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { FlattenMaps, HydratedDocument, Types } from "mongoose";

export type DomainDocument = HydratedDocument<Domain>;

// `collection: "domain"` keeps the existing collection name (the default would
// pluralise the class name to "domains" and silently point at an empty one).
@Schema({ timestamps: true, collection: "domain" })
export class Domain {
  @Prop({ required: true, unique: true, lowercase: true, index: true })
  name: string;

  @Prop({ default: "" })
  cloudflare_id: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ required: true, index: true })
  owner: string;

  @Prop({ default: true })
  verify: boolean;

  @Prop({ default: "active" })
  status: string;

  @Prop()
  apply_time: Date;

  @Prop()
  last_update: Date;

  @Prop()
  expire_time: Date;

  @Prop({ default: "flexible" })
  ssl: string;

  @Prop({ default: false })
  premium: boolean;

  @Prop({ default: false })
  exclusive: boolean;

  @Prop({ default: false })
  disable: boolean;

  // `timestamps: true` adds createdAt / updatedAt automatically.
}

export const DomainSchema = SchemaFactory.createForClass(Domain);

/** Shape accepted by write operations (every field optional, no timestamps). */
export type DomainWrite = Partial<Domain>;

/** Raw shape returned by a `.lean()` query (still carries `_id`). */
export type DomainLean = FlattenMaps<Domain> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

/** Public shape returned by the service: `_id`/`__v` normalised to `id`. */
export type DomainPublic = Omit<DomainLean, "_id"> & { id: string };
