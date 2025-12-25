"use client";
import { Send, UserRound } from "lucide-react";
import { Pagination } from "../Pagination/Pagination";
import { Modal } from "../Modal/Modal";

// Interfaces / Types

interface IAccordionItem {
  title: string;
  content: React.ReactNode;
}

// Dynamic Components

function ProfilePicture() {
  return (
    <div className="w-12 h-12 rounded-full bg-gray-400/40 flex justify-center items-center">
      <UserRound size={24} />
    </div>
  );
}

function SearchResults() {
  return (
    <div>
      <h2 className="text-lg font-bold">Search Results</h2>
      <p className="text-zinc-500">No results found</p>
    </div>
  );
}

function AccordionItem({ title, content }: IAccordionItem) {
  return (
    <div className="bg-white w-full h-22 flex flex-row items-center gap-6 p-4 rounded-xl">
      <div>
        <ProfilePicture />
      </div>

      <div className="w-full h-full flex-col items-center">
        <p className="text-zinc-900 font-bold">Jane Doe</p>
        <p className="text-zinc-300 clamp-1 w-sm">jxd220034@utdallas.edu</p>
      </div>

      <div className="w-full h-full flex justify-end items-center">
        <button className="hover:cursor-pointer hover:text-zinc-800">
          <Send className="text-zinc-400" size={24} />
        </button>
      </div>
    </div>
  );
}

function AccordionList() {
  return (
    <div className="w-full max-h-304 flex flex-col gap-4 overflow-scroll">
      <AccordionItem title="Item 1" content={<div>Content 1</div>} />
      <AccordionItem title="Item 2" content={<div>Content 2</div>} />
      <AccordionItem title="Item 3" content={<div>Content 3</div>} />
    </div>
  );
}

export { Pagination, AccordionList };
