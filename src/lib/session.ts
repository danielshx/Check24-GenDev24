import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-very-secret-key";

interface Payload {
  userId: number;
  username: string;
}

export function generateToken(payload: Payload): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });
}

export function validateToken(token: string): number | boolean {
  try {
    const decodedToken = jwt.verify(token, SECRET_KEY) as Payload;
    return decodedToken.userId;
  } catch (error) {
    return false;
  }
}
