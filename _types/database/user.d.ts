export type User = {
  id: string;
  githubId: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  birth: string;
  avatar: string;
  description: string;
  badge: [string];
  beta: boolean;
  warn: number;
  disabled: boolean;
  premium: boolean;
  createdAt: NativeDate;
  updatedAt: NativeDate;
};

export type UserWrite = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

export type UserSchema = Omit<User, "id"> & {
  _id: string;
};
