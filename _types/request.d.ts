import { Request } from "express";


export interface VerifiedRequest extends Request {
  JWT: string;
  githubId: string;
}
