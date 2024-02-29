export type User = {
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
  createdAt: NativeDate;
  updatedAt: NativeDate;
};

export type UserPublic = Omit<
  User,
  "githubId" | "primaryEmail" | "beta" | "warn" | "updatedAt"
>;

export type UserWrite = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

export type UserSchema = Omit<User, "id"> & {
  _id: string;
};
