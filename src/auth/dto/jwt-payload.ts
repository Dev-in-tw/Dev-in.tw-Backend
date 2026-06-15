/** Claims carried in the signed JWT. `sub` is the user's Mongo `id`. */
export interface JwtPayload {
  sub: string;
}
