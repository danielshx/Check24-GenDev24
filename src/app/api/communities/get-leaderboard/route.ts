import { parseUrl } from "next/dist/shared/lib/router/utils/parse-url";
import { prisma } from "@/lib/prisma";
import { CommunityMembership } from "@prisma/client";
import { cookies } from "next/headers";
import { validateToken } from "@/lib/session";

export async function GET(req: Request) {
  const communityId = parseUrl(req.url as string).query.id;
  const startPlace = parseUrl(req.url as string).query.s || 0;
  const endPlace = parseUrl(req.url as string).query.e || 10;
  const userId = validateToken(cookies().get("token")?.value as string);

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

  const members = await prisma.communityMembership.findMany({
    where: {
      community_id: parseInt(communityId as string),
    },
    include: {
      user: true,
    },
  });

  let leaderboard = await getLeaderboard(members);
  const pinnedMembers = await prisma.pin.findMany({
    where: {
      community_id: parseInt(communityId as string),
    },
  });

  leaderboard = leaderboard.map((entry) => {
    return {
      ...entry,
      pinned: pinnedMembers.find((pin) => pin.pinned_user_id === entry.user_id)
        ? true
        : false,
    };
  });

  const userEntry = leaderboard.find((entry) => entry.user_id === userId);
  if (!userEntry)
    return new Response(
      JSON.stringify({
        message: "User not found in community",
      }),
      { status: 404 }
    );

  const pinnedUsers = leaderboard.filter((entry) =>
    pinnedMembers.find((pin) =>
      pinnedMembers.map((t) => t.user_id).includes(pin.user_id)
    )
  );

  if (startPlace == "-1") {
    if (leaderboard.length < 7) {
      return new Response(
        JSON.stringify({
          leaderboard: leaderboard,
        }),
        { status: 200 }
      );
    }
    /*
    the top 3 users of the community
    the user who is currently logged in
    the user who is currently before the logged-in user
    the user who is currently after the logged-in user
    the user who is currently on the last place

    Which sums up to 7 users in total in these sneak preview leaderboards.

    Make sure to think of these scenarios:

    the logged-in user can be part of the top 3 users of the community (no duplicates in the leaderboard) *
    the logged-in user can be on the last place of the community (no duplicates in the leaderboard) *
    ranks are determined like this: 1, 1, 1, 4
    sort by users registration date when points are equal
    when community has less than 7 users: show all the users who are part of the community
    you will still need to return 7 users in total. This means you have to "fill out" your preview by showing more users around the logged-in user.

    */

    let returnV: any[] = [];

    // Get the top 3 users of the community
    const top3Users = leaderboard.slice(0, 3);
    // check if the logged-in user is in the top 3 users and add 4th user if yes
    if (top3Users.some((entry) => entry.user_id === userId)) {
      const userAfterTop3 = leaderboard.find(
        (entry) => !top3Users.some((e) => e.user_id === entry.user_id)
      );
      if (userAfterTop3) {
        returnV.push(userAfterTop3);
      }
    } else returnV.push(...top3Users);
    // Get the logged-in user
    const loggedInUser = leaderboard.find((entry) => entry.user_id === userId);
    if (loggedInUser) {
      returnV.push(loggedInUser);
    }

    if (!loggedInUser?.position)
      return new Response(
        JSON.stringify({
          message: "User not found in community",
        }),
        { status: 404 }
      );

    // Get the user before the logged-in user
    const userBefore = leaderboard.find(
      (entry) => entry.position === loggedInUser?.position - 1
    );
    if (
      userBefore &&
      !returnV.some((entry) => entry.user_id === userBefore.user_id)
    ) {
      returnV.push(userBefore);
    }

    // Get the user after the logged-in user
    const userAfter = leaderboard.find(
      (entry) => entry.position === loggedInUser?.position + 1
    );
    if (
      userAfter &&
      !returnV.some((entry) => entry.user_id === userAfter.user_id)
    ) {
      returnV.push(userAfter);
    }

    // Get the user on the last place
    const lastPlaceUser = leaderboard[leaderboard.length - 1];
    if (
      lastPlaceUser &&
      !returnV.some((entry) => entry.user_id === lastPlaceUser.user_id)
    ) {
      returnV.push(lastPlaceUser);
    }

    // Sort the leaderboard by registration date when points are equal, smaller id = older user
    returnV.sort((a, b) => {
      if (a.points === b.points) {
        return b.user_id - a.user_id;
      }
      return b.points - a.points;
    });

    // Fill out the remaining users to reach a total of 7
    const remainingUsers = leaderboard
      .slice(3)
      .filter((entry) => entry !== loggedInUser);
    remainingUsers.forEach((entry) => {
      if (
        returnV.length < 7 &&
        !returnV.some((e) => e.user_id === entry.user_id)
      ) {
        returnV.push(entry);
      }
    });

    return new Response(
      JSON.stringify({
        leaderboard: returnV.sort((a, b) => a.position - b.position),
      }),
      { status: 200 }
    );
  }

  return new Response(
    JSON.stringify({
      leaderboard: leaderboard.slice(startPlace as number, endPlace as number),
    }),
    { status: 200 }
  );
}

const getLeaderboardEntries = async (user_id: number) => {
  const user = await prisma.user.findFirst({
    where: {
      id: user_id,
    },
  });
  const points = await getPointsOfMember(user_id);
  return {
    position: 0,
    user_id: user_id,
    username: user?.username,
    points,
  };
};

const getLeaderboard = async (members: CommunityMembership[]) => {
  const leaderboard = await Promise.all(
    members.map(async (member, index) => {
      return await getLeaderboardEntries(member.user_id);
    })
  );

  return leaderboard
    .sort((a, b) => b.points - a.points)
    .map((user, index) => ({
      ...user,
      position: index + 1,
    }));
};

const getPointsOfMember = async (userId: number) => {
  const bets = await prisma.bet.findMany({
    where: {
      user_id: userId,
    },
  });

  const matches = await prisma.match.findMany({
    where: {
      id: {
        in: bets.map((bet) => bet.match_id),
      },
    },
  });

  // 8 points for correct result
  // 6 points for correct goal different if not a draw
  // 4 points for correct winner
  // 0 points for everything else

  return bets.reduce((acc, bet) => {
    const match = matches.find((match) => match.id === bet.match_id);

    if (!match) return acc;

    if (!match.result_away || !match.result_home) return acc;

    if (
      match.result_away === bet.result_away &&
      match.result_home === bet.result_home
    )
      return acc + 8;

    if (
      match.result_away !== match.result_home &&
      match.result_away - match.result_home ===
        bet.result_away - bet.result_home
    )
      return acc + 6;

    if (
      (match.result_away > match.result_home &&
        bet.result_away > bet.result_home) ||
      (match.result_away < match.result_home &&
        bet.result_away < bet.result_home) ||
      (match.result_away === match.result_home &&
        bet.result_away === bet.result_home)
    )
      return acc + 4;

    return acc;
  }, 0);
};
