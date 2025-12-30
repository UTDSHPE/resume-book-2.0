"use client";
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe } from "react-icons/fa6";
import { ProfileForm } from "@/app/hooks/useProfileForm";

/* 
  Table of Contents for our Helper Components for our Modal:
  - Defined Button Component
  - All the social media button variants
  - Final conditional render of these social media links
*/

// Simple button wrapper component that handles events
function Btn({
  children,
  className,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex justify-center items-center w-21 h-12 rounded-lg ${className} ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:opacity-80 transition-opacity"
      }`}
    >
      {children}
    </button>
  );
}

type social_media_link = {
  link: string | null;
};

/* 
  Below is all the social media option that MAY appear based on if the student's modal
  per what they filled out on their profile.

  Note: This button group can be more modular. 
*/

// Github Button
function GithubBtn({ link }: social_media_link) {
  const handleClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Btn
      className="bg-zinc-900 text-white"
      onClick={handleClick}
      disabled={!link}
    >
      <FaGithub size={24} />
    </Btn>
  );
}

// Linkedin Button
function LinkedinBtn({ link }: social_media_link) {
  const handleClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Btn
      className="bg-blue-600 text-white"
      onClick={handleClick}
      disabled={!link}
    >
      <FaLinkedin size={24} />
    </Btn>
  );
}

// Twitter Button
function TwitterBtn({ link }: social_media_link) {
  const handleClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Btn
      className="bg-sky-500 text-white"
      onClick={handleClick}
      disabled={!link}
    >
      <FaTwitter size={24} />
    </Btn>
  );
}

// External Link Button
function ExternalBtn({ link }: social_media_link) {
  const handleClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Btn
      className="bg-gray-700 text-white"
      onClick={handleClick}
      disabled={!link}
    >
      <FaGlobe size={24} />
    </Btn>
  );
}

/* 
  This is the component that will conditionally render all the social media link/s
  the student provides on their profile. This component gets its "links" from its 
  parent component.
*/

function SocialsGroup({ links }: { links: ProfileForm["links"] }) {
  return (
    <div className="w-full h-12 flex flex-row justify-end items-center gap-2 mt-2">
      {links.github && <GithubBtn link={links.github} />}
      {links.linkedin && <LinkedinBtn link={links.linkedin} />}
      {links.twitter && <TwitterBtn link={links.twitter} />}
      {links.website && <ExternalBtn link={links.website} />}
    </div>
  );
}

export { SocialsGroup, Btn };
