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

// One object that holds all social links, keyed by enum
export type SocialLinks = Partial<Record<SocialPlatform, string>>;

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
    platform: SocialPlatform;                /** Which key to edit */
    value: string;                           /** Current value from parent */
    onChange: (url: string) => void;         /** Update this one key */
    className?: string;
    required?: boolean;
    pattern?: string;                        /** Regex pattern (defaults to https://...) */
    title?: string;                          /** Error tooltip */
};

export const LinkRow: React.FC<LinkRowProps> = ({
    platform,
    value,
    onChange,
    className = "",
    required,
    pattern = "^https://.+",
    title = "Must be a valid URL (https:// prefix)",
}) => {
    const { label, Icon, placeholder } = META[platform];

    return (
        <label className={`form-control text-base-content text-sm ${className}`}>
            <span className="label-text">{label}</span>
            <div className="flex items-center gap-2">
                <Icon className="text-2xl opacity-80" />
                <input
                    type="url"
                    className="input input-bordered w-full"
                    placeholder={placeholder}
                    required={required}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    pattern={pattern}
                    title={title}
                />
            </div>
            <span className="label-text-alt"> </span>
        </label>
    );
};

/* =========================
   Group of inputs (helper)
   ========================= */
export const SocialLinksFields: React.FC<{
    links: SocialLinks;                            // controlled object from parent
    onChange: (next: SocialLinks) => void;         // parent updates state
    platforms?: SocialPlatform[];                  // optionally choose which to render
}> = ({ links, onChange, platforms = Object.values(SocialPlatform) }) => (
    <div className="grid gap-3">
        {platforms.map((p) => (
            <LinkRow
                key={p}
                platform={p}
                value={links[p] ?? ""}
                onChange={(url) => onChange({ ...links, [p]: url })}
            />
        ))}
    </div>
);
