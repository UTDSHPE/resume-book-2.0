"use client";
import { useReducer } from "react";
import type React from "react";
import { SocialPlatform, Links } from "@/components/filterComponents/LinkInput";

export type Availability = "Full-time" | "Internship";
export type GradSemester = "Spring" | "Fall" | null;

export type ProfileForm = {
    firstName: string;
    lastName: string;
    email: string;
    utdEmail: string;
    phone: string;
    gpa: number | null;
    gradYear: number | null;
    major: string;
    gradSemester: GradSemester;
    availability: Availability[];
    workAuthorized: boolean;
    profilePhoto: string | null;
    resumeUrl: string | null;
    links: Links; // ✅ same type as LinkInput file
};

export const initial: ProfileForm = {
    firstName: "",
    lastName: "",
    email: "",
    utdEmail: "",
    phone: "",
    gpa: null,
    gradYear: null,
    major: "",
    gradSemester: null,
    availability: [],
    workAuthorized: false,
    profilePhoto: null,
    resumeUrl: null,
    links: {
        [SocialPlatform.Github]: "",
        [SocialPlatform.LinkedIn]: "",
        [SocialPlatform.Twitter]: "",
        [SocialPlatform.Website]: "",
    },
};

export type Action =
    | { type: "set"; key: keyof ProfileForm; value: any }
    | { type: "merge"; value: Partial<ProfileForm> }
    | { type: "reset"; value?: ProfileForm };

export function reducer(state: ProfileForm, action: Action): ProfileForm {
    switch (action.type) {
        case "set":
            return { ...state, [action.key]: action.value };
        case "merge":
            return { ...state, ...action.value };
        case "reset":
            return action.value ?? initial;
        default:
            return state;
    }
}

export function useProfileForm(defaults?: Partial<ProfileForm>) {
    const [form, dispatch] = useReducer(reducer, { ...initial, ...defaults });

    const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
        dispatch({ type: "set", key, value });

    const bind = <K extends keyof ProfileForm>(key: K) => ({
        value: form[key] as ProfileForm[K],
        onChange: (v: ProfileForm[K]) => update(key, v),
    });

    const bindInput = <K extends keyof ProfileForm>(key: K) => ({
        value: (form[key] ?? "") as any,
        onChange: (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >
        ) => update(key, (e.target as HTMLInputElement).value as any),
    });

    const bindNumber = <K extends keyof ProfileForm>(key: K) => ({
        value: (form[key] ?? "") as any,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const s = e.target.value;
            update(key, (s === "" ? null : Number(s)) as any);
        },
    });

    const bindCheckbox = (key: keyof ProfileForm) => ({
        checked: Boolean(form[key]),
        onChange: (e: React.ChangeEvent<HTMLInputElement> | boolean) =>
            update(
                key as any,
                typeof e === "boolean"
                    ? e
                    : (e.target as HTMLInputElement).checked
            ),
    });

    // ✅ helpers for nested links
    type LinkKey = keyof Links; // = SocialPlatform
    const updateLink = (k: LinkKey, url: string) =>
        update("links", { ...form.links, [k]: url });
    const bindLink = (k: LinkKey) => ({
        value: form.links[k],
        onChange: (v: string) => updateLink(k, v),
    });

    return { form, update, bind, bindInput, bindNumber, bindCheckbox, updateLink, bindLink };
}
