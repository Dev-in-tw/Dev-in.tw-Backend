import {
  JwtPayload,
  Secret,
  sign as jwtSign,
  decode as jwtDecode,
  verify as jwtVerify
} from "jsonwebtoken";


export class JWT {
  token: string | null = null;
  payload: JwtPayload | null = null;

  constructor(input: string | object) {
    if (typeof input === "string") {
      this.token = input;
    }
    else if (typeof input === "object") {
      this.payload = input;
    }
  }

  sign() {
    if (this.token) {
      return this.token;
    }
    else if (this.payload) {
      this.token = jwtSign(this.payload, process.env.JWT_SECRET, {
        expiresIn: "3d"
      });
      return this.token;
    }
    else {
      throw new Error("No token or payload provided");
    }
  }

  decode() {
    if (this.token) {
      this.payload = jwtDecode(this.token) as JwtPayload;
      return this.payload;
    }
    else if (this.payload) {
      return this.payload;
    }
    else {
      throw new Error("No token or payload provided");
    }
  }

  verify() {
    if (this.token) {
      this.payload = jwtVerify(
        this.token,
        process.env.JWT_SECRET,
      ) as JwtPayload;
      return this.payload;
    }
    else if (this.payload) {
      return this.payload;
    }
    else {
      throw new Error("No token or payload provided");
    }
  }

  valid() {
    if (this.token) {
      try {
        if (jwtVerify(this.token, process.env.JWT_SECRET as Secret)) {
          return true;
        }
        return false;
      }
      catch (error) {
        return false;
      }
    }
    else if (this.payload) {
      return undefined;
    }
    else {
      throw new Error("No token or payload provided");
    }
  }
}
