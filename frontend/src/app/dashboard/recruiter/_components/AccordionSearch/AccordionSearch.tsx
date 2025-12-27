"use client";
import React, { useState } from "react";
import { AccordionListLayout } from "./accordion-utils";
import { Pagination } from "../Pagination/Pagination";
import { AccordionItem } from "./accordion-utils";
import { SearchResults } from "./accordion-utils";
import { Modal } from "../Modal/Modal";

/* 
  Table of Contents for Accordion Search Component
  Description: This component will render all the students that meet the filters
  set by recruiter in the recruiter page (its parent component).

  File Structure:
  - Interface / Types defined
  - Accordion Layout Component
  - Final Accordion Search Component that is composed of its children components
    found in the "accordion-utils" file.
*/

// Interfaces / types
import { type ProfileForm } from "@/app/hooks/useProfileForm";

interface IChildren {
  children: React.ReactNode;
}

// Accordion Layout Component
function AccordionLayout({ children }: IChildren) {
  return (
    <div className="card bg-base-200 shadow-md h-full p-4 flex flex-col items-center gap-3">
      {children}
    </div>
  );
}

// Final Accordion Search Render

/* 
  AccordionSearch Component
  
  This component manages the student search results display and modal interactions.
  It receives a filtered list of student profiles and handles:
  - Rendering each student as a clickable card
  - Opening a detailed modal when a student is clicked
  - Closing the modal when the user clicks outside or dismisses it
  
  State tracks which student is selected and whether the modal is currently open.
*/

function AccordionSearch({ users }: { users: ProfileForm[] }) {
  const [selectedUser, setSelectedUser] = useState<ProfileForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserClick = (user: ProfileForm) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <AccordionLayout>
        <AccordionListLayout>
          <SearchResults quantity={users.length ?? 0} />
          {users.map((user, i) => (
            <AccordionItem
              key={i}
              user={user}
              onClick={() => handleUserClick(user)}
            />
          ))}
        </AccordionListLayout>
        <Pagination />
      </AccordionLayout>

      {isModalOpen && selectedUser && (
        <Modal user={selectedUser} onClose={closeModal} />
      )}
    </>
  );
}

export default AccordionSearch;
