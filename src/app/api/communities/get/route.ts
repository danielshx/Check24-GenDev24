// Create a function where the user_id is passed in the post request and it creates a new entry in the communitymembership table

import { prisma } from "@/lib/prisma";
import { validateToken } from "@/lib/session";
import { parseUrl } from "next/dist/shared/lib/router/utils/parse-url";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const communityId = parseUrl(req.url as string).query.id;

  const user_id = validateToken(cookies().get("token")?.value as string);

  if (!user_id)
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
      }),
      { status: 401 }
    );

  const community = await prisma.community.findFirst({
    where: {
      id: parseInt(communityId as string),
    },
  });

  if (!community)
    return new Response(
      JSON.stringify({
        message: "Community not found",
      }),
      { status: 404 }
    );

  const userMemberOfCommunity = await prisma.communityMembership.findFirst({
    where: {
      user_id: user_id as number,
      community_id: parseInt(communityId as string),
    },
  });

  return new Response(
    JSON.stringify({
      community: community,
      userMemberOfCommunity: !!userMemberOfCommunity,
    }),
    { status: 200 }
  );
}
