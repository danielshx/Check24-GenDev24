"use client";
import {
  ChevronUpIcon,
  DrawingPinFilledIcon,
  DrawingPinIcon,
} from "@radix-ui/react-icons";
import { Layout } from "../overview";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export const Overview: React.FC<{
  userId: number;
}> = ({ userId }) => {
  const [isMember, setIsMember] = useState<boolean>(true);
  const params = useParams();

  useEffect(() => {
    fetch(
      `/api/communities/is-member?user_id=${userId}&community_id=${params.communityId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setIsMember(data.isMember);
      });
  }, []);

  return (
    <Layout
      action={
        <Button
          onClick={() => {
            fetch("/api/communities/join", {
              method: "POST",
              body: JSON.stringify({
                user_id: userId,
                community_id: parseInt(params.communityId as string),
              }),
            }).then(() => {
              setIsMember(true);
            });
          }}
          variant={"outline"}
          className={`bg-transparent text-white ${isMember && "hidden"}`}
          size={"sm"}
        >
          Join Community
        </Button>
      }
    >
      <div className="w-full">
        <div className="w-full h-12 bg-gray-200 font-semibold text-sm px-2 flex items-center">
          Community name
        </div>

        <TableHeader />
        <TableContent
          userId={userId}
          communityId={parseInt(params.communityId as string)}
        />
      </div>
    </Layout>
  );
};

const TableContent: React.FC<{
  userId: number;
  communityId: number;
}> = ({ userId, communityId }) => {
  const [leaderboard, setLeaderboard] = useState<
    {
      position: number;
      user_id: number;
      username: string;
      points: number;
      pinned?: boolean;
    }[]
  >([]);

  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(10);

  const fetchLeaderboard = async (
    communityId: number,
    startIndex: number,
    endIndex: number
  ) => {
    fetch(
      `/api/communities/get-leaderboard?id=${communityId}&s=${startIndex}&e=${endIndex}`
    )
      .then((res) => res.json())
      .then((data) => {
        // append
        if (!data.leaderboard) return;
        if (data.leaderboard.length === 0) return;
        setLeaderboard([...leaderboard, ...data.leaderboard]);

        /*const newData = [...leaderboard, ...data.leaderboard];
        // remove duplicates, and sort by position
        const uniqueData = Array.from(
          new Set(newData.map((a) => a.user_id))
        ).map((user_id) => {
          return newData.find((a) => a.user_id === user_id);
        });

        // first one array with pinned users and current user sorted by position
        // second one array with the rest of the users sorted by position
        // merged in to one array

        const pinnedUsers = uniqueData.filter((entry) => entry.pinned);
        const userEntry = uniqueData.find((entry) => entry.user_id === userId);

        const firstArray = [
          userEntry,
          ...pinnedUsers.map((entry) => {
            return { ...entry, pinned: true };
          }),
        ].sort((a, b) => a.position - b.position);

        const secondArray = uniqueData
          .filter(
            (entry) => !pinnedUsers.includes(entry) && entry.user_id !== userId
          )
          .sort((a, b) => a.position - b.position);

        setLeaderboard([...firstArray, ...secondArray]);*/
      });
  };

  useEffect(() => {
    // fetchLeaderboard(communityId, -1, 0);
    fetchLeaderboard(communityId, 0, 10);
    //setStartIndex(-10);
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    {
      position: number;
      user_id: number;
      username: string;
      points: number;
      pinned?: boolean;
    }[]
  >([]);

  return (
    <>
      <div className="w-full h-12 border-b flex items-center">
        <Input
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchResults(
              leaderboard.filter((entry) =>
                entry.username
                  .toLowerCase()
                  .includes(e.target.value.toLowerCase())
              )
            );
          }}
          className="w-full border-none shadow-none rounded-none"
          placeholder="User..."
        />
      </div>
      <LoadMore
        up={true}
        onClick={() => {
          if (startIndex === 0) return;
          fetchLeaderboard(communityId, startIndex - 10, endIndex - 10);
          setStartIndex(startIndex - 10);
          setEndIndex(endIndex - 10);
        }}
      />
      <div>
        {searchQuery !== "" ? (
          <>
            {searchResults.length === 0 ? (
              <div className="w-full h-12 flex justify-center items-center text-blue-900 border-b text-sm">
                No results found
              </div>
            ) : (
              <>
                {searchResults.map((item, index) => (
                  <TableItem
                    key={index}
                    pos={item.position}
                    plusMinus={0}
                    name={item.username}
                    lastBets={""}
                    points={item.points}
                    current_user={item.user_id === userId}
                    currentUserId={userId}
                    userId={item.user_id}
                    pinned={item.pinned}
                    communityId={communityId}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {leaderboard.map((item, index) => (
              <TableItem
                current_user={item.user_id === userId}
                key={index}
                pos={item.position}
                plusMinus={0}
                name={item.username}
                lastBets={""}
                points={item.points}
                currentUserId={userId}
                userId={item.user_id}
                pinned={item.pinned}
                communityId={communityId}
              />
            ))}
          </>
        )}
      </div>
      <LoadMore
        up={false}
        onClick={() => {
          fetchLeaderboard(communityId, startIndex + 10, endIndex + 10);
          setStartIndex(startIndex + 10);
          setEndIndex(endIndex + 10);
        }}
      />
    </>
  );
};

const TableHeader: React.FC<{}> = ({}) => {
  /*
    Pos
    +/-
    Name
    Last Bets
    Points
  */
  return (
    <div className="w-full h-12 bg-white border-b-4 border-gray-200 font-semibold text-sm px-2 flex items-center">
      <div className="w-2/12">Pos</div>
      <div className="w-2/12">+/-</div>
      <div className="w-4/12">Name</div>
      <div className="w-4/12">Last Bets</div>
      <div className="w-2/12">PKT</div>
    </div>
  );
};

const TableItem: React.FC<{
  pos: number;
  plusMinus: number;
  name: string;
  lastBets: string;
  points: number;
  current_user: boolean;
  currentUserId: number;
  userId: number;
  pinned?: boolean;
  communityId: number;
}> = ({
  pos,
  plusMinus,
  name,
  lastBets,
  points,
  current_user,
  currentUserId,
  userId,
  pinned,
  communityId,
}) => {
  const [isPinned, setIsPinned] = useState<boolean>(pinned || false);
  const onClick = () => {
    fetch("/api/communities/pin", {
      method: "POST",
      body: JSON.stringify({
        user_id: currentUserId,
        community_id: communityId,
        pinned_user_id: userId,
      }),
    }).then(() => {
      setIsPinned(!isPinned);
    });
  };

  return (
    <div
      className={`w-full relative group pl-4 h-10  border-b border-gray-200 font-normal text-sm flex items-center ${
        current_user ? "bg-blue-100" : "bg-white"
      }`}
    >
      <div className="w-2/12">{pos}</div>
      <div className="w-2/12">{plusMinus}</div>
      <div
        className={`w-4/12 overflow-hidden truncate ${
          current_user && "font-semibold"
        }`}
      >
        {name}
      </div>
      <div className="w-4/12">{lastBets}</div>
      <div className="w-2/12">{points}</div>
      <div
        onClick={onClick}
        className={`w-6 h-6 ${
          current_user && "hidden"
        } opacity-0 group-hover:opacity-100  ${
          isPinned && "opacity-100"
        } cursor-pointer hover:bg-slate-100 duration-100 absolute right-2 top-2 rounded flex justify-center items-center`}
      >
        {isPinned ? (
          <DrawingPinFilledIcon className="w-3.5 h-3.5" />
        ) : (
          <DrawingPinIcon className="w-3.5 h-3.5" />
        )}
      </div>
    </div>
  );
};

const LoadMore: React.FC<{
  up: boolean;
  onClick?: () => void;
}> = ({ up, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-full hover:cursor-pointer h-10 border-b justify-center font-semibold text-sm px-2 flex items-center`}
    >
      <ChevronUpIcon
        className={`w-5 h-5 text-blue-600 ${up ? "" : "rotate-180"}`}
      />
    </div>
  );
};
