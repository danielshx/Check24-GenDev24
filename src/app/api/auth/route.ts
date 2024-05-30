import { validateToken } from "@/lib/session";
import { NextApiRequest } from "next";

export default async function handler(req: NextApiRequest) {
  const { token } = req.cookies;

  console.log(token)
  if (!token) {
    return new Response(
      JSON.stringify({
        message: "No token provided",
      }),
      { status: 401 }
    );
  }

  const user = validateToken(token);
  if (!user) {
    return new Response(
      JSON.stringify({
        message: "Invalid token",
      }),
      { status: 401 }
    );
  }

  return new Response(
    JSON.stringify({
      user,
    }),
    { status: 200 }
  );
}
