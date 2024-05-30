"use client";
import { Community } from "@prisma/client";
import { useEffect, useState } from "react";
import { Footer, Navbar } from "./navbar";
import Link from "next/link";
import {
  ChevronRightIcon,
  MinusCircledIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CreateCommunityDialog } from "./create-community-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Layout: React.FC<{
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ action, children }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-lg py-20 relative h-screen border w-full px-2">
        <Navbar
          action={
            <div className="w-full absolute top-0 left-0 h-14 flex justify-between items-center px-4 bg-[#063773]">
              <Image className="mt-1" alt="" src="/check24logo.png" width={100} height={50} />
              {action}
            </div>
          }
        />
        <div className="w-full h-full overflow-auto p-2">{children}</div>
        <Footer />
      </div>
    </div>
  );
};

const CommunityList: React.FC<{
  communities: Community[];
  title: string;
  searchActive: boolean;
  pagination?: boolean;
  maxItemsPerPage?: number;
}> = ({ communities, title, searchActive, pagination, maxItemsPerPage }) => {
  const [displayedCommunities, setDisplayedCommunities] = useState<Community[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let result = communities;

    if (searchQuery !== "") {
      setCurrentPage(1);
      result = result.filter((community) =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (pagination) {
      const start = (currentPage - 1) * maxItemsPerPage!;
      const end = start + maxItemsPerPage!;
      result = result.slice(start, end);
    }

    setDisplayedCommunities(result);
  }, [searchQuery, currentPage, communities, maxItemsPerPage, pagination]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full h px-4">
      <div className="w-full h-14 flex items-center justify-between border-b-2">
        <div className="font-semibold text-lg">{title}</div>
        {searchActive && (
          <div className="flex items-center space-x-2">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search"
              className="w-32 h-8 border text-xs rounded-md px-2"
            />
          </div>
        )}
      </div>

      {displayedCommunities.length === 0 && (
        <div className="w-full h-14 flex items-center justify-center">
          <div className="text-slate-600 text-sm flex space-x-2 items-center">
            <MinusCircledIcon className="w-3 h-3 mr-3" />
            No communities to show
          </div>
        </div>
      )}

      {displayedCommunities.map((community) => (
        <Link href={`/communities/${community.id}`} key={community.id}>
          <div className="h-14 w-full flex ">
            <div className="w-14 h-14 shrink-0 flex items-center justify-center">
              <div className="w-5 h-5  rounded-full bg-slate-200"></div>
            </div>
            <div className="h-full w-full border-b flex justify-between items-center">
              <div className="">
                <div className="text-md text-slate-700">{community.name}</div>
                <div className="text-xs text-slate-400">
                  {"community.location"}
                </div>
              </div>

              <div className="flex space-x-1 items-center">
                <div className="text-xs">{"12"}</div>
                <ChevronRightIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      ))}

      {pagination && (
        <div className="w-full h-14 flex items-center justify-end">
          <PaginationI
            currentPage={currentPage}
            totalPages={Math.ceil(communities.length / maxItemsPerPage!)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

const PaginationI: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      onPageChange(value);
    }
  };

  return (
    <Pagination className="">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className="hover:cursor-pointer"
            onClick={() => {
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
          />
        </PaginationItem>
        {pages.map((page) => {
          if (
            page === currentPage ||
            page === currentPage - 1 ||
            page === currentPage + 1
          ) {
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return null;
        })}
        <PaginationItem>
          <PaginationNext
            className="hover:cursor-pointer"
            onClick={() => {
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

const YourCommunities: React.FC<{
  userId: number;
}> = ({ userId }) => {
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: 1,
      name: "Community 1",
    },
    {
      id: 2,
      name: "Community 2",
    },
    {
      id: 3,
      name: "Community 3",
    },
    {
      id: 4,
      name: "Community 4",
    },
    {
      id: 5,
      name: "Community 5",
    },
    {
      id: 6,
      name: "Community 6",
    },
    {
      id: 7,
      name: "Community 7",
    },
    {
      id: 8,
      name: "Community 8",
    },
    {
      id: 9,
      name: "Community 8",
    },
    {
      id: 10,
      name: "Community 8",
    },
  ]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);

  useEffect(() => {
    fetch("/api/communities/get-all")
      .then((res) => res.json())
      .then((data) => {
        setCommunities(data.communities);
        setUserCommunities(data.userCommunities);
      });
  }, [false]);

  return (
    <div className="space-y-14">
      <CommunityList
        communities={userCommunities}
        title="Your Communities"
        searchActive={false}
        pagination={false}
      />
      <CommunityList
        communities={communities}
        title="Communities"
        searchActive={true}
        pagination={true}
        maxItemsPerPage={10}
      />
    </div>
  );
};

export const CommunitesOverview: React.FC<{
  userId: number;
}> = ({ userId }) => {
  return (
    <Layout
      action={
        <CreateCommunityDialog>
          <Button
            variant={"outline"}
            size={"sm"}
            className=" text-white bg-inherit"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Create Community
          </Button>
        </CreateCommunityDialog>
      }
    >
      <YourCommunities userId={userId} />
    </Layout>
  );
};
