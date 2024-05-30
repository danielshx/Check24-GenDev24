import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/session";

export async function POST(req: Request) {
  const { username } = await req.json();

  const user = await prisma.user.findFirst({
    where: {
      username: username.toLowerCase(),
    },
  });

  if (!user) {
    return new Response(JSON.stringify({
      message: "User not found",
    }), { status: 404 });
  }

  const resp = {
    user: user,
    token: generateToken({ userId: user.id, username: user.username }),
    redirect: "/",
  };

  // redirect with cookie

  return new Response(JSON.stringify(resp), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `token=${resp.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=60*60*24*7;`,
    },
  });
}
