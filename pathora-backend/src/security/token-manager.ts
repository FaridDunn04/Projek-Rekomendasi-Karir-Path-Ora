
import jwt, { type JwtPayload } from "jsonwebtoken";
import { nanoid } from "nanoid";
import { config } from "../config/index.js";

export interface TokenPayload {
  id: string;
  email: string;
  sid: string;
}

export const tokenManager = {

  sign(payload: Omit<TokenPayload, "sid"> & { sid?: string }): string {
    return jwt.sign({ ...payload, sid: payload.sid ?? nanoid(12) }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  },

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return {
      id: decoded["id"] as string,
      email: decoded["email"] as string,
      sid:
        typeof decoded["sid"] === "string"
          ? decoded["sid"]
          : `${decoded["id"] as string}:${decoded["email"] as string}`,
    };
  },
};
