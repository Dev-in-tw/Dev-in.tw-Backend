import { Schema, model } from "mongoose";


const userSchema = new Schema(
  {
    githubId: String,
    email: String,
    name: String,
    first_name: String,
    last_name: String,
    birth: String,
    avatar: String,
    description: String,
    badge: [String],
    beta: Boolean,
    warn: Number,
    disabled: Boolean,
    premium: Boolean
  },
  { timestamps: true },
);

export default model("user", userSchema, "user");
