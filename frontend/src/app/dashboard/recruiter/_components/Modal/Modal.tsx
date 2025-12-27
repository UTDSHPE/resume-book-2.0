import { FileText, Send, User } from "lucide-react";
import { type ProfileForm } from "@/app/hooks/useProfileForm";
import React from "react";
import { SocialsGroup } from "./social-buttons";
import { Btn } from "./social-buttons";

/* 
  Table of Contents for Modal Component
  Description: Detailed student profile modal that displays complete information about a selected student.
  Opens when a recruiter clicks on a student card in the search results.
  
  File Structure:
  - ModalLayout: Container wrapper providing card styling and structure
  - ModalBanner: Decorative header banner at the top of the modal
  - UserProfileImg: Large profile photo or default user icon
  - LineSeperator: Visual divider between sections
  - UserInfo: Main content section showing student details and social links
  - ActionGroup: Bottom action buttons for viewing resume and sending messages
  - Modal: Main component that orchestrates all modal parts and handles closing
*/

/* 
  ModalLayout Component
  
  Provides the white card container for the modal content.
  Creates a bordered box with rounded corners and shadow for the modal's visual structure.
*/
function ModalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-150 h-104 bg-white rounded-xl p-[4px]">
      <div className="w-full h-full bg-[#fff] shadow rounded-lg flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

/* 
  ModalBanner Component
  
  Decorative gray banner displayed at the top of the modal.
  Provides visual separation and design polish for the profile header area.
*/
function ModalBanner() {
  return (
    <div className="w-full h-30 bg-zinc-200 rounded-tl-xl rounded-tr-xl"></div>
  );
}

/* 
  UserProfileImg Component
  
  Displays the student's profile photo overlaid on the banner.
  Shows uploaded photo if available, otherwise displays a default user icon.
  Positioned absolutely to overlap the banner for a card-style layout.
*/
function UserProfileImg({ photo }: { photo?: string | null }) {
  return (
    <div className="absolute w-26 h-26 top-9 left-4 bg-white rounded-full p-1">
      <div className="bg-zinc-200/30 w-full h-full rounded-full overflow-hidden">
        {photo ? (
          <img src={photo} alt="user" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            <User size={48} />
          </div>
        )}
      </div>
    </div>
  );
}

/* 
  LineSeperator Component
  
  Thin horizontal line used to visually separate different sections of student information.
  Provides clean visual structure within the modal content.
*/
function LineSeperator() {
  return <div className="w-full h-[1px] bg-zinc-200" />;
}

/* 
  UserInfo Component
  
  Main content section displaying comprehensive student details including:
  - Social media links (conditionally rendered based on what student provided)
  - Full name and email
  - Academic information (major, graduation semester/year, GPA)
  
  Receives complete user profile data and passes links to SocialsGroup for rendering.
*/
function UserInfo({ user }: { user: ProfileForm }) {
  return (
    <div className="w-full h-full flex flex-col items-start justify-start gap-6 px-4">
      <SocialsGroup links={user.links} />
      <div className="w-full h-12 flex flex-col items-start justify-start">
        <p className="text-zinc-900 text-xl">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-base text-zinc-400">{user.email}</p>
      </div>
      <LineSeperator />
      <div className="w-full h-20 flex flex-col gap-1 text-zinc-500 text-sm">
        <p>{user.major}</p>
        <p>
          {user.gradSemester} {user.gradYear}
        </p>
        {user.gpa && <p>GPA: {user.gpa}</p>}
      </div>
    </div>
  );
}

/* 
  ActionGroup Component
  
  Bottom action bar with two primary functions:
  - Resume button: Opens the student's uploaded resume PDF in a new tab
  - Message button: Triggers email composition to contact the student
  
  Note: Resume and email functionality needs to be implemented with proper handlers.
*/
function ActionGroup({ user }: { user: ProfileForm }) {
  const handleResumeClick = () => {
    if (user.resumeUrl) {
      window.open(user.resumeUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full flex flex-row gap-3 justify-end p-4">
      <Btn
        className="bg-white border border-zinc-500 text-zinc-500"
        onClick={handleResumeClick}
        disabled={!user.resumeUrl}
      >
        <FileText size={24} />
      </Btn>
      <Btn className="bg-zinc-900 text-white">
        <Send />
      </Btn>
    </div>
  );
}

/* 
  Modal Component
  
  Main modal wrapper that displays detailed student profile information in an overlay.
  Handles user interaction for closing the modal:
  - Clicking outside the modal (on backdrop) closes it
  - Clicking inside the modal content keeps it open (stopPropagation)
  
  Receives the selected student's profile data and a close handler from parent component.
  Renders all modal sections in a structured layout with profile photo, details, and actions.
*/
interface IModal {
  user: ProfileForm;
  onClose: () => void;
}

export function Modal({ user, onClose }: IModal) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <ModalLayout>
          <ModalBanner />
          <UserProfileImg photo={user.profilePhoto} />
          <UserInfo user={user} />
          <ActionGroup user={user} />
        </ModalLayout>
      </div>
    </div>
  );
}
