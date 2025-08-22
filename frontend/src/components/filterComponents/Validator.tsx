"use client";
import React, { useEffect, useMemo, useState } from "react";

export interface NumberValidatorProps {
    min: number;
    max: number;
    className?: string;
    /** Allow decimals at all */
    decimal?: boolean;
    /** If set, show exactly this many decimal places on blur (only when decimal = true) */
    decimals?: number;
    headTitle?: string;
    required?: boolean;
    placeholder?: string;

    // Controlled:
    value?: number | null;
    onChange?: (v: number | null) => void;

    // Uncontrolled:
    defaultValue?: number | null;
}

export const NumberValidator: React.FC<NumberValidatorProps> = ({
    min,
    max,
    className = "",
    decimal = false,
    decimals,
    headTitle,
    required,
    placeholder,
    value,
    onChange,
    defaultValue = null,
}) => {
    const isControlled = value !== undefined;

    // keep a string for the input so the user can type freely
    const [local, setLocal] = useState<string>(defaultValue == null ? "" : String(defaultValue));

    // sync local if parent changes defaultValue while uncontrolled
    useEffect(() => {
        if (!isControlled) setLocal(defaultValue == null ? "" : String(defaultValue));
    }, [defaultValue, isControlled]);

    // current displayed value (controlled vs local)
    const display = isControlled ? (value == null ? "" : String(value)) : local;

    // step attribute
    const stepAttr = useMemo(() => {
        if (!decimal) return 1;
        if (typeof decimals === "number" && decimals >= 0) {
            return Number((1 / Math.pow(10, decimals)).toFixed(decimals));
        }
        return "any";
    }, [decimal, decimals]);

    const parse = (s: string): number | null => {
        if (s.trim() === "") return null;
        const n = Number(s);
        return Number.isNaN(n) ? null : n;
    };

    const clamp = (n: number): number => {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    };

    const format = (n: number): string => {
        if (decimal && typeof decimals === "number") return n.toFixed(decimals);
        return String(n);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = e.target.value;
        if (isControlled) {
            onChange?.(parse(s));
        } else {
            setLocal(s);
            onChange?.(parse(s));
        }
    };

    // On blur, clamp to range and optionally format decimals
    const handleBlur = () => {
        const current = parse(display);
        if (current == null) return;

        const clamped = clamp(current);
        const formatted = format(clamped);

        if (isControlled) {
            onChange?.(clamped);
        } else {
            setLocal(formatted);
            onChange?.(clamped);
        }
    };

    // ----- validation state for styling -----
    const parsed = parse(display);
    const isEmpty = display.trim() === "";
    const isNotNumber = !isEmpty && parsed === null;
    const isOutOfRange = parsed != null && (parsed < min || parsed > max);
    const isInvalid = (required && isEmpty) || isNotNumber || isOutOfRange;

    return (
        <div className={`form-control ${className}`}>
            {headTitle && (
                <label className="label">
                    <span
                        className={`label-text text-xs font-medium ${isInvalid ? "text-error" : "text-black"
                            }`}
                    >
                        {headTitle}
                    </span>
                </label>
            )}

            <input
                type="number"
                className={`input input-bordered w-full text-base-content ${isInvalid ? "input-error" : ""}`}
                placeholder={placeholder ?? `${min}-${max}`}
                min={min}
                max={max}
                step={stepAttr as any}
                required={required}
                value={display}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={isInvalid}
                title={`Must be between ${min} and ${max}`}
            />

            <label className="label text-base-content">
                <span className={`label-text-alt text-base-content/70 text-xs ${isInvalid ? "text-error" : ""}`}>
                    {decimal && typeof decimals === "number"
                        ? `Range: ${min}–${max} • ${decimals} decimal place${decimals === 1 ? "" : "s"}`
                        : `Must be between ${min} and ${max}`}
                </span>
            </label>
        </div>
    );
};
