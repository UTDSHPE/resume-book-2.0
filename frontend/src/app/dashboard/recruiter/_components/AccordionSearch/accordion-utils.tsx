"use client";
import { Send, UserRound } from "lucide-react";
import { type ProfileForm } from "@/app/hooks/useProfileForm";

/* 
  Table of Contents for Accordion Utilities
  Description: Helper components for rendering individual student cards in the search results.
  These components work together to display student profile information in a clickable card format.
  
  File Structure:
  - ProfilePicture: Displays student's profile photo or default icon
  - SearchResults: Header showing the number of students matching current filters
  - AccordionItem: Main clickable card showing student preview
  - AccordionListLayout: Container wrapper for the list of student cards
*/

/* 
  ProfilePicture Component
  
  Displays a student's profile photo if available, otherwise shows a default user icon.
*/
function ProfilePicture({ user }: { user: ProfileForm }) {
  return (
    <div className="w-12 h-12 rounded-full bg-gray-600/40 flex justify-center items-center">
      {user.profilePhoto ?? <UserRound size={24} />}
    </div>
  );
}

/* 
  SearchResults Component
  
  Displays a header showing the total count of students matching the current filter criteria.
  Shows "Search Results" label followed by the number of matching profiles.
  Receives quantity as a prop which can be null if count is not yet determined.
*/
function SearchResults({ quantity }: { quantity: number }) {
  return (
    <div className="flex flex-row gap-2 items-center justify-start text-zinc-800 px-4">
      <h2 className="text-lg font-bold">Search Results: </h2>
      <p className="">{quantity}</p>
    </div>
  );
}

/* 
  AccordionItem Component
  
  Individual student card that displays basic profile information in a compact format.
  Clicking the card triggers the parent's onClick handler to open the detailed modal.
  Includes a send message button that prevents modal opening when clicked (stopPropagation).
  
  Shows: profile picture, full name, email, and message action button.
*/
function AccordionItem({
  user,
  onClick,
}: {
  user: ProfileForm;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white w-full h-22 flex flex-row items-center gap-6 p-4 rounded-xl hover:cursor-pointer hover:opacity-75 transition-colors duration-300"
      onClick={onClick}
    >
      <div>
        <ProfilePicture user={user} />
      </div>
      <div className="w-full h-full flex-col items-center">
        <p className="text-zinc-900 font-bold">
          {user.firstName + " " + user.lastName}
        </p>
        <p className="text-zinc-300 clamp-1 w-sm">{user.email}</p>
      </div>
      <div className="w-full h-full flex justify-end items-center">
        <button
          className="hover:cursor-pointer hover:text-zinc-800"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Send className="text-zinc-400" size={24} />
        </button>
      </div>
    </div>
  );
}

/* 
  AccordionListLayout Component
  
  Scrollable container that wraps all student cards. 
  Allows vertical scrolling when the list of students exceeds the maximum height.
  Provides consistent spacing and layout for the student card grid.
*/
function AccordionListLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-h-304 flex flex-col gap-4 overflow-scroll">
      {children}
    </div>
  );
}

export { AccordionListLayout, AccordionItem, SearchResults };
