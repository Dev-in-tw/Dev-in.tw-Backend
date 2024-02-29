import { Schema, model } from "mongoose";


const userSchema = new Schema(
  {
    userName: String,
    githubId: String,
    primaryEmail: String,
    name: String,
    avatar: String,
    description: String,
    badge: [String] || [],
    beta: Boolean,
    warn: Number,
    disabled: Boolean,
    premium: Boolean
  },
  { timestamps: true },
);

export default model("user", userSchema, "user");
