"use client";
import React from "react";
import { FaSquareXTwitter, FaSquareGithub, FaLinkedin, FaGlobe } from "react-icons/fa6";

/* =========================
   Enum + types
   ========================= */
export enum SocialPlatform {
    Github = "github",
    LinkedIn = "linkedin",
    Twitter = "twitter",
    Website = "website",
}

export type Links = Record<SocialPlatform, string>;

/* =========================
   Metadata per platform
   ========================= */
const META: Record<
    SocialPlatform,
    { label: string; Icon: React.ComponentType<{ className?: string }>; placeholder: string }
> = {
    [SocialPlatform.Github]: {
        label: "GitHub",
        Icon: FaSquareGithub,
        placeholder: "https://github.com/username",
    },
    [SocialPlatform.LinkedIn]: {
        label: "LinkedIn",
        Icon: FaLinkedin,
        placeholder: "https://www.linkedin.com/in/username",
    },
    [SocialPlatform.Twitter]: {
        label: "X (Twitter)",
        Icon: FaSquareXTwitter,
        placeholder: "https://x.com/handle",
    },
    [SocialPlatform.Website]: {
        label: "Website",
        Icon: FaGlobe,
        placeholder: "https://yourdomain.com",
    },
};

/* =========================
   Single input row
   ========================= */
type LinkRowProps = {
    platform: SocialPlatform;
    value: string;
    onChange: (url: string) => void;
};

export const LinkRow: React.FC<LinkRowProps> = ({ platform, value, onChange }) => {
    const { label, Icon, placeholder } = META[platform];

    return (
        <label className="form-control text-base-content text-sm">
            <span className="label-text">{label}</span>
            <div className="flex items-center gap-2">
                <Icon className="text-2xl opacity-80" />
                <input
                    type="url"
                    className="input input-bordered w-full"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </label>
    );
};

/* =========================
   Group of inputs (helper)
   ========================= */
export const SocialLinksFields: React.FC<{
    links: Links;
    onChange: (next: Links) => void;
    platforms?: SocialPlatform[];
}> = ({
    links,
    onChange,
    platforms = Object.values(SocialPlatform) as SocialPlatform[],
}) => (
        <div className="grid gap-3">
            {platforms.map((p) => (
                <LinkRow
                    key={p}
                    platform={p}
                    value={links[p]}
                    onChange={(url) => onChange({ ...links, [p]: url })}
                />
            ))}
        </div>
    );
