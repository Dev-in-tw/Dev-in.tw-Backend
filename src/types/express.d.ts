import { JwtPayload } from "../auth/dto/jwt-payload";

// Augment Express's Request so `request.user` (set by JwtAuthGuard and read by
// the @CurrentUser() decorator) is typed instead of `any`.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
