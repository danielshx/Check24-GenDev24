/*
 useEffect(() => {
    fetch(
      `/api/communities/is-member?user_id=${userId}&community_id=${router.query.communityId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setIsMember(data.isMember);
      });
  });
*/

import { prisma } from "@/lib/prisma";

import { parseUrl } from "next/dist/shared/lib/router/utils/parse-url";

export async function GET(req: Request) {
  const { user_id, community_id } = parseUrl(req.url as string).query;
  const userCommunities = await prisma.communityMembership.findMany({
    where: {
      user_id: parseInt(user_id as string),
    },
  });

  const userAlreadyJoined = userCommunities.find(
    (community) => community.community_id === parseInt(community_id as string)
  );

  return new Response(
    JSON.stringify({
      isMember: !!userAlreadyJoined,
    }),
    { status: 200 }
  );
}
