"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CountryFlag from "@/components/CountryFlag";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bet, Match, Team } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";

interface MatchBetDialogProps {
  match: Match;
  userId: number;
  homeTeam: Team;
  awayTeam: Team;
  previousBet: Bet | null;
  children: React.ReactNode;
}

const MatchBetDialog: React.FC<MatchBetDialogProps> = ({
  match,
  userId,
  homeTeam,
  awayTeam,
  children,
  previousBet,
}) => {
  const [homeScore, setHomeScore] = useState(previousBet?.result_home || 0);
  const [awayScore, setAwayScore] = useState(previousBet?.result_away || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const response = await fetch("/api/bet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        match_id: match.id,
        result_home: homeScore,
        result_away: awayScore,
      }),
    });

    setIsSubmitting(false);
    if (!response.ok) {
      toast({
        title: "Error",
        description: "Failed to submit bet",
      });
    } else {
      setOpen(false);
      toast({
        title: "Success",
        description: "Bet submitted",
      });
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your bet (changeable until game start)</DialogTitle>
          <DialogDescription>
            {homeTeam.name} vs {awayTeam.name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <CountryFlag country={homeTeam.code} />
            <Input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <CountryFlag country={awayTeam.code} />
            <Input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant={"ghost"}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MatchBetDialog;
