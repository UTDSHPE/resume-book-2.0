"use client";
import React, { useEffect, useMemo, useState } from "react";
import { FaLinkedin, FaGlobe, FaGithubSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export type SocialPlatform = "github" | "linkedin" | "twitter" | "website";

export type SocialURLs =
    | { github: string }
    | { linkedin: string }
    | { twitter: string }
    | { website: string };

type BaseProps = {
    platform: SocialPlatform; /** Which type of link this field edits */
    label?: string; /*Label shown above the input (optional) */
    className?: string;/* daisyUI/utility classes */
    required?: boolean;/** HTML required attr pass - through */
    pattern?: string;/** Pattern check (defaults to a sane URL regex) */
    title?: string;/** Title shown on pattern mismatch */
};

/**
 * Controlled usage: pass `value` and `onChange`
 * Uncontrolled usage: pass `defaultValue` (and optionally onChange if you still want notifications)
 */
type ControlledProps = BaseProps & {//use when the whole is edited as an object like a form or something
    value: string;
    defaultValue?: never;
    onChange: (url: string) => void;
};
type UncontrolledProps = BaseProps & {//use when updated individually
    value?: never;
    defaultValue?: string;
    onChange?: (url: string) => void;
};

export type LinkInputProps = ControlledProps | UncontrolledProps;

export const LinkInput: React.FC<LinkInputProps> = ({
    platform,
    label,
    className = "",
    required,
    pattern = "^https://.+",
    title = "Must be a valid URL (https:// prefix)",
    ...rest
}) => {
    // icon per platform
    const Icon = useMemo(() => {
        switch (platform) {
            case "github":
                return FaGithubSquare;
            case "linkedin":
                return FaLinkedin;
            case "twitter":
                return FaSquareXTwitter;
            default:
                return FaGlobe;
        }
    }, [platform]);

    // controlled vs uncontrolled
    const isControlled = "value" in rest;
    const [local, setLocal] = useState(rest.defaultValue ?? "");

    // keep local in sync if defaultValue prop changes (rare)
    useEffect(() => {
        if (!isControlled && "defaultValue" in rest) {
            setLocal(rest.defaultValue ?? "");
        }
    }, [isControlled, rest]);

    const value = isControlled ? rest.value : local;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        if (isControlled) {
            rest.onChange?.(url);
        } else {
            setLocal(url);
            rest.onChange?.(url);
        }
    };

    return (
        <label className={`form-control text-base-content text-sm ${className}`}>
            {label && <span className="label-text ">{label}</span>}
            <div className="flex items-center gap-2">
                <Icon className="text-2xl opacity-80" />
                <input
                    type="url"
                    className="input input-bordered w-full"
                    placeholder="https://"
                    required={required}
                    value={value}
                    onChange={handleChange}
                    pattern={pattern}
                    title={title}
                />
            </div>
            <span className="label-text-alt"> </span>
        </label>
    );
};

/* ---------- helper, if you still want the one-key union ---------- */
export const toSocialUnion = (platform: SocialPlatform, url: string): SocialURLs =>
    ({ [platform]: url } as SocialURLs);
