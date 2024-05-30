"use client";

import Image from "next/image";
import { Layout } from "./(dashboard)/communities/overview";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Community, Match, Team, User } from "@prisma/client";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import CountryFlag from "@/components/CountryFlag";

export default function Home() {
  return (
    <Layout
      action={
        <Link href={"/matches"}>
          <Button
            variant={"outline"}
            className="bg-transparent text-white"
            size={"sm"}
          >
            Bet now
          </Button>
        </Link>
      }
    >
      <div className="w-full">
        <NextMatches />
        <CommunityPreviews userId={20} />
      </div>
    </Layout>
  );
}

const NextMatches: React.FC = () => {
  const [matches, setMatches] = useState<
    {
      id: number;
      home_team: {
        name: string;
        code: string;
      };
      away_team: {
        name: string;
        code: string;
      };
      start_date: Date;
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/matches")
      .then((data) => data.json())
      .then((resp) => {
        const teams = resp.teams;
        const matches = resp.matches;

        const convertedMatches = matches.map((match: Match) => {
          const homeTeam = teams.find(
            (team: Team) => team.id === match.home_team
          );
          const awayTeam = teams.find(
            (team: Team) => team.id === match.away_team
          );

          return {
            id: match.id,
            home_team: {
              name: homeTeam.name,
              code: homeTeam.code,
            },
            away_team: {
              name: awayTeam.name,
              code: awayTeam.code,
            },
            start_date: new Date(match.start_date),
          };
        });

        setMatches(convertedMatches.slice(0, 5));
      });
  }, []);

  return (
    <div className="w-full p-2">
      <div className="w-full h-12 border-b flex justify-between items-center">
        <div className="font-semibold text-slate-800">Nächste Spiele</div>
        <Link href="/matches">
          <div className="text-sm cursor-pointer font-semibold text-slate-500 flex items-center">
            Alle Spiele <ChevronRightIcon className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>
      <div>
        {matches.map((match) => (
          <MatchItem key={match.id} data={match} />
        ))}
      </div>
    </div>
  );
};

const MatchItem: React.FC<{
  data: {
    home_team: {
      name: string;
      code: string;
    };
    away_team: {
      name: string;
      code: string;
    };
    start_date: Date;
  };
}> = ({ data }) => {
  const formattedDate = new Date(data.start_date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = new Date(data.start_date).toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });

  return (
    <div className="w-full border-b flex items-center justify-between">
      <div className="w-96 h-16">
        <div className="w-full pt-2 px-2 text-xs font-medium text-slate-800">
          {formattedDate}
        </div>
        <div className="p-2 flex space-x-5">
          <div className="flex space-x-2 items-center w-32">
            <div className="w-5 h-3 rounded overflow-hidden flex justify-center items-center">
              <CountryFlag country={data.home_team.code} />
            </div>
            <div className="text-sm font-medium">{data.home_team.name}</div>
          </div>
          <div className="text-sm font-semibold">v.</div>
          <div className="flex space-x-2 items-center w-32">
            <div className="w-5 h-3 rounded overflow-hidden flex justify-center items-center">
              <CountryFlag country={data.away_team.code} />
            </div>
            <div className="text-sm font-medium">{data.away_team.name}</div>
          </div>
        </div>
      </div>
      <Link href={"/matches"}>
        <div className="w-16 h-16 flex cursor-pointer justify-end px-3 items-center">
          <ChevronRightIcon className="w-5 h-5 text-slate-800" />
        </div>
      </Link>
    </div>
  );
};

const CommunityPreviews: React.FC<{
  userId: number;
}> = ({ userId }) => {
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    fetch("/api/communities/get-all")
      .then((data) => data.json())
      .then((resp) => {
        setCommunities(resp.userCommunities);
      });
  }, []);

  return (
    <div className="space-y-5">
      {communities.map((community) => (
        <CommunityPreview
          key={community.id}
          communityId={community.id}
          userId={userId}
        />
      ))}
    </div>
  );
};

const CommunityPreview: React.FC<{
  communityId: number;
  userId: number;
}> = ({ communityId, userId }) => {
  const [community, setCommunity] = useState<Community>({} as Community);
  const [users, setUsers] = useState<
    {
      user_id: number;
      username: string;
      position: number;
      points: number;
    }[]
  >([]);

  useEffect(() => {
    fetch(`/api/communities/get?id=${communityId}`)
      .then((data) => data.json())
      .then((resp) => {
        setCommunity(resp.community);
        fetch(`/api/communities/get-leaderboard?id=${communityId}&s=-1`)
          .then((data) => data.json())
          .then((resp) => {
            setUsers(resp.leaderboard);
          });
      });
  }, []);

  return (
    <div className="w-full p-2">
      <div className="w-full h-12 border-b border-blue-500 flex justify-between items-center">
        <div className="font-semibold text-slate-800">{community.name}</div>
        <Link href={"/communities/" + communityId}>
          <div className="text-sm cursor-pointer font-semibold text-slate-500 flex items-center">
            Mehr Details <ChevronRightIcon className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>
      <div>
        {users.map((user, index) => (
          <UserItem key={index} data={user} />
        ))}
      </div>
    </div>
  );
};

const UserItem: React.FC<{
  data: {
    user_id: number;
    username: string;
    position: number;
    points: number;
  };
}> = ({ data }) => {
  return (
    <div className="w-full h-8 border-b flex justify-between items-center">
      <div className="flex items-center px-3">
        <div className="w-12 text-sm font-semibold flex">{data.position}</div>
        <div className="w-24 text-sm">{data.username}</div>
      </div>

      <div className="text-sm">{data.points}</div>
    </div>
  );
};
