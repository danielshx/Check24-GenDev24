"use client";
import { Bet, Match, Team } from "@prisma/client";
import CountryFlag from "@/components/CountryFlag";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MatchBetDialog from "./match-bet-dialog";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  LockClosedIcon,
  MixerHorizontalIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Footer, Navbar } from "../communities/navbar";
import { Layout } from "../communities/overview";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MatchesListProps {
  userId: number;
}

export const MatchesList: React.FC<MatchesListProps> = ({ userId }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const response = await fetch("/api/matches");
      const data = await response.json();
      setMatches(data.matches);
      setTeams(data.teams);
      setBets(data.bets);
    };

    fetchMatches();
  }, []);

  return (
    <Layout
      action={
        <Link href="/admin/matches">
          <Button
            variant={"outline"}
            className="bg-transparent text-white"
            size={"sm"}
          >
            Admin Settings
          </Button>
        </Link>
      }
    >
      <div className="w-full h px-4">
        <div className="w-full h-14 flex items-center justify-between border-b-2">
          <div className="font-semibold text-lg">Matches</div>
        </div>
        <div className="w-full h-full">
          <div className="w-full space-y-2 py-2">
            {matches.map((match) => (
              <MatchItem
                key={match.id}
                match={match}
                userId={userId}
                bets={bets}
                teams={teams}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface MatchItemProps {
  match: Match;
  userId: number;
  bets: Bet[];
  teams: Team[];
}

const MatchItem: React.FC<MatchItemProps> = ({
  match,
  userId,
  bets,
  teams,
}) => {
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [userBet, setUserBet] = useState<Bet | null>(null);

  useEffect(() => {
    setHomeTeam(teams.find((team) => team.id === match.home_team) as Team);
    setAwayTeam(teams.find((team) => team.id === match.away_team) as Team);

    setUserBet(
      bets.find(
        (bet) => bet.match_id === match.id && bet.user_id === userId
      ) as Bet
    );
  }, [teams, bets]);

  if (!homeTeam || !awayTeam) return null;

  const formattedDate = new Date(match.start_date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  const alreadyStarted = new Date(match.start_date) < new Date();

  return (
    <TooltipProvider>
      <div className="w-full border-b flex items-center justify-between">
        <div className="w-[330px] h-16 flex">
          <div>
            <div className="w-full pt-2 px-2 text-xs font-medium text-slate-800">
              {formattedDate}
            </div>
            <div className="p-2 flex space-x-5">
              <div className="flex space-x-2 items-center w-32">
                <div className="w-5 h-3 rounded overflow-hidden flex justify-center items-center">
                  <CountryFlag country={homeTeam.code} />
                </div>
                <div className="text-sm font-medium">{homeTeam.name}</div>
              </div>
              <div className="text-sm font-semibold">v.</div>
              <div className="flex space-x-2 items-center w-32">
                <div className="w-5 h-3 rounded overflow-hidden flex justify-center items-center">
                  <CountryFlag country={awayTeam.code} />
                </div>
                <div className="text-sm font-medium">{awayTeam.name}</div>
              </div>
            </div>
          </div>
        </div>

        {alreadyStarted ? (
          <>
            {match.result_home !== null && match.result_away !== null ? (
              <div className="w-16 h-7 items-center border-blue-500 bg-blue-100 rounded flex justify-between border px-2">
                <div className="text-sm">{match.result_home}</div>
                <div className="text-sm">{"-"}</div>
                <div className="text-sm">{match.result_home}</div>
              </div>
            ) : (
              <div className="w-16 shrink-0 h-16 flex cursor-pointer justify-end px-3 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <LockClosedIcon className="w-5 h-5 text-slate-800" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Match has already started
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </>
        ) : (
          <MatchBetDialog
            awayTeam={awayTeam}
            homeTeam={homeTeam}
            userId={userId}
            match={match}
            previousBet={userBet}
          >
            {!userBet ? (
              <div className="w-16 shrink-0 h-16 flex cursor-pointer justify-end px-3 items-center">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <ChevronRightIcon className="w-4 h-4 text-slate-800" />
                  </TooltipTrigger>
                  <TooltipContent>Edit your bet</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="w-16 h-7 items-center bg-slate-100 rounded flex justify-between border px-2">
                <div className="text-sm">{userBet.result_home}</div>
                <div className="text-sm">{"-"}</div>
                <div className="text-sm">{userBet.result_away}</div>
              </div>
            )}
          </MatchBetDialog>
        )}
      </div>
    </TooltipProvider>
  );
};
