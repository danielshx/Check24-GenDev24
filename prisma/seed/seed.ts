/*
import sqlite3
import datetime
import * as fs from 'fs';

class Match:
    
    def __init__(self, match_number, round, date, location, home_team, away_team, group_name):
        self.match_number = match_number
        self.round = round
        self.date = date
        self.location = location
        self.home_team = home_team
        self.away_team = away_team
        self.group_name = group_name
        

def read_matches(file_name):
    matches = []
    with open(file_name, 'r') as file:
        # Skip the header
        file.readline()
        for line in file:
            match_number, round, date, location, home_team, away_team, group_name, result = line.strip().split(',')
            matches.append(Match(int(match_number), round, date, location, home_team, away_team, group_name))
         
    return matches


*/
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { parse } from "path";
const prisma = new PrismaClient();

function parseDate(dateStr: string): Date {
  // Split the date and time parts
  const parts = dateStr.split(" ");
  const dateParts = parts[0].split("/");
  const timeParts = parts[1].split(":");

  // Extract the day, month, year, hour, and minute
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are zero-indexed
  const year = parseInt(dateParts[2], 10);
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);

  // Create and return the date object
  return new Date(year, month, day, hour, minute);
}

const initTeams = async () => {
  const teams = {
    "Germany": "DE",
    "Belgium": "BE",
    "France": "FR",
    "Portugal": "PT",
    "Scotland": "SCT",
    "Spain": "ES",
    "Türkiye": "TR",
    "Austria": "AT",
    "England": "EN",
    "Hungary": "HU",
    "Slovakia": "SK",
    "Albania": "AL",
    "Denmark": "DK",
    "Netherlands": "NL",
    "Romania": "RU",
    "Switzerland": "CH",
    "Serbia": "RS",
    "Czech Republic": "CZ",
    "Italy": "IT",
    "Slovenia": "SI",
    "Croatia": "HR",
    "Georgia": "GE",
    "Ukraine": "UA",
    "Poland": "PL"
  }
  
  for (const [name, code] of Object.entries(teams)) {
    await prisma.team.create({
      data: {
        name,
        code
      }
    });
  }
};

function read_matches(file_name: string) {
  const matches = [];
  const fileContent = readFileSync(file_name, "utf-8");
  const lines = fileContent.split("\n");
  // Skip the header
  lines.shift();
  for (const line of lines) {
    const [
      match_number,
      round,
      date,
      location,
      home_team,
      away_team,
      group_name,
      result,
    ] = line.trim().split(",");

    if (!date) {
        
    }

    matches.push({
      match_number: parseInt(match_number),
      round,
      date: parseDate(date),
      location,
      home_team,
      away_team,
      group_name,
    });
  }
  return matches;
}


async function main() {
  await initTeams();
  const matches = read_matches("matches.csv");
  for (const match of matches) {
    const home_team = await prisma.team.findFirst({
      where: {
        name: match.home_team,
      },
    });

    const away_team = await prisma.team.findFirst({
      where: {
        name: match.away_team,
      },
    });

    if (!home_team || !away_team) {
      console.log(`Could not find teams for match ${match.match_number}`);
      continue;
    }

    await prisma.match.create({
      data: {
        start_date: match.date.toISOString(),
        home_team: home_team.id,
        away_team: away_team.id,
      },
    });
  }
}

main();
