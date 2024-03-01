import { Omit } from "_module/Omit";


export class User {
  id: string;
  userName: string;
  githubId: string;
  primaryEmail: string;
  name: string;
  avatar: string;
  description: string;
  badge: [string] | [];
  beta: boolean;
  warn: number;
  disabled: boolean;
  premium: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserPublic extends Omit(User, [
  "githubId",
  "primaryEmail",
  "beta",
  "warn",
  "updatedAt"
]) {}

// export class UserPublic {
//   id: string;
//   userName: string;
//   name: string;
//   avatar: string;
//   description: string;
//   badge: [string] | [];
//   disabled: boolean;
//   premium: boolean;
//   createdAt: string;
// }

export type UserWrite = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

export type UserSchema = Omit<User, "id"> & {
  _id: string;
};
