"use client";
import React, { useEffect, useId, useMemo, useState } from "react";

/* ---------- utils ---------- */
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ==================================================
   UTD Email (domain-enforced, with invalid styling)
   ================================================== */
export interface UTDEmailInputProps {
    domain: string;                 // e.g. "utdallas.edu"
    allowSubdomains?: boolean;      // default: true
    className?: string;
    label?: string;
    required?: boolean;

    // Controlled:
    value?: string;
    onChange?: (email: string) => void;

    // Uncontrolled:
    defaultValue?: string;

    placeholder?: string;
    title?: string;
}

export const UTDEmailInput: React.FC<UTDEmailInputProps> = ({
    domain,
    allowSubdomains = true,
    className = "",
    label = "UTD email",
    required,
    value,
    onChange,
    defaultValue,
    placeholder,
    title,
}) => {
    const isControlled = value !== undefined;
    const [local, setLocal] = useState(defaultValue ?? "");
    const id = useId();

    useEffect(() => {
        if (!isControlled) setLocal(defaultValue ?? "");
    }, [defaultValue, isControlled]);

    const current = isControlled ? (value as string) : local;

    const host = useMemo(() => {
        const esc = escapeRegex(domain);
        return allowSubdomains ? `(?:[A-Za-z0-9-]+\\.)*${esc}` : esc;
    }, [domain, allowSubdomains]);

    const pattern = useMemo(() => new RegExp(`^[A-Za-z0-9._%+-]+@${host}$`, "i"), [host]);
    const isEmpty = current.trim() === "";
    const isInvalid = (required && isEmpty) || (!isEmpty && !pattern.test(current));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        if (isControlled) onChange?.(next);
        else {
            setLocal(next);
            onChange?.(next);
        }
    };

    const handleBlur = () => {
        const normalized = current.trim().toLowerCase();
        if (normalized === current) return;
        if (isControlled) onChange?.(normalized);
        else {
            setLocal(normalized);
            onChange?.(normalized);
        }
    };

    return (
        <div className={`form-control ${className}`}>
            <label className="label">
                <span className={`label-text text-xs font-medium ${isInvalid ? "text-error" : "text-black"}`}>
                    {label}
                </span>
            </label>

            <input
                id={id}
                type="email"
                inputMode="email"
                autoComplete="email"
                className={`input input-bordered w-full text-base-content ${isInvalid ? "input-error" : ""}`}
                required={required}
                placeholder={placeholder ?? `example@${domain}`}
                // keep the HTML pattern in sync with our regex for native validation:
                pattern={`^[A-Za-z0-9._%+-]+@${allowSubdomains ? `(?:[A-Za-z0-9-]+\\.)*` : ""}${escapeRegex(domain)}$`}
                title={
                    title ??
                    `Email must end with ${allowSubdomains ? `*.${domain}` : domain}`
                }
                value={current}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={isInvalid}
            />

            <label className="label">
                <span className={`label-text-alt text-xs ${isInvalid ? "text-error" : "text-base-content/70"}`}>
                    {allowSubdomains ? `Use your @*.${domain} address` : `Use your @${domain} address`}
                </span>
            </label>
        </div>
    );
};

/* ==================================================
   General Email (invalid styling)
   ================================================== */
export interface EmailInputProps {
    className?: string;
    label?: string;
    required?: boolean;

    // Controlled:
    value?: string;
    onChange?: (email: string) => void;

    // Uncontrolled:
    defaultValue?: string;

    placeholder?: string;
    patternOverride?: string; // if you want to override the default regex entirely
    title?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
    className = "",
    label = "Email",
    required,
    value,
    onChange,
    defaultValue,
    placeholder = "name@example.com",
    patternOverride,
    title = "Enter a valid email address",
}) => {
    const isControlled = value !== undefined;
    const [local, setLocal] = useState(defaultValue ?? "");
    const id = useId();

    useEffect(() => {
        if (!isControlled) setLocal(defaultValue ?? "");
    }, [defaultValue, isControlled]);

    const current = isControlled ? (value as string) : local;

    // simple, reasonable pattern; type="email" also helps in browsers
    const defaultPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const regex = useMemo(
        () => (patternOverride ? new RegExp(patternOverride) : defaultPattern),
        [patternOverride]
    );

    const isEmpty = current.trim() === "";
    const isInvalid = (required && isEmpty) || (!isEmpty && !regex.test(current));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        if (isControlled) onChange?.(next);
        else {
            setLocal(next);
            onChange?.(next);
        }
    };

    const handleBlur = () => {
        const normalized = current.trim().toLowerCase();
        if (normalized === current) return;
        if (isControlled) onChange?.(normalized);
        else {
            setLocal(normalized);
            onChange?.(normalized);
        }
    };

    return (
        <div className={`form-control ${className}`}>
            <label className="label">
                <span className={`label-text text-xs font-medium ${isInvalid ? "text-error" : "text-black"}`}>
                    {label}
                </span>
            </label>

            <input
                id={id}
                type="email"
                inputMode="email"
                autoComplete="email"
                className={`input input-bordered w-full text-base-content ${isInvalid ? "input-error" : ""}`}
                required={required}
                placeholder={placeholder}
                pattern={patternOverride ?? defaultPattern.source}
                title={title}
                value={current}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={isInvalid}
            />

            <label className="label">
                <span className={`label-text-alt text-xs ${isInvalid ? "text-error" : "text-base-content/70"}`}>
                    Enter a valid email address
                </span>
            </label>
        </div>
    );
};
