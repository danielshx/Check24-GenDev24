import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/session";

export async function POST(req: Request) {
  const { username } = await req.json();

  

  const user = await prisma.user.findFirst({
    where: {
      username: username.toLowerCase(),
    },
  });

  if (user) {
    return new Response(JSON.stringify({
      message: "User already exists",
    }), { status: 400 });
  }

  const newUser = await prisma.user.create({
    data: {
      username: username.toLowerCase(),
    },
  });

  const resp = {
    user: newUser,
    token: generateToken({ userId: newUser.id, username: newUser.username }),
    redirect: "/",
  };

  return new Response(JSON.stringify(resp), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `token=${resp.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=60*60*24*7;`,
    },
  });
}
