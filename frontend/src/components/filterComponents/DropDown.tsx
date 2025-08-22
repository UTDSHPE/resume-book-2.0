"use client";
import React, { useEffect, useState } from "react";

type DropDownProps = {
    items: string[];
    label: string;
    className?: string;
    required?: boolean;

    /** Controlled value (preferred when using a single form object) */
    value?: string;
    /** Uncontrolled initial value */
    defaultValue?: string;

    /** Optional placeholder row shown when nothing selected */
    placeholder?: string;

    /** Change handler returns the selected string */
    onChange?: (selected: string) => void;

    /** @deprecated use defaultValue or placeholder instead */
    dataLabel?: string;
};

export const DropDown: React.FC<DropDownProps> = ({
    items,
    label,
    className = "",
    required,
    value,
    defaultValue,
    placeholder = "",
    onChange,
    dataLabel, // deprecated alias
}) => {
    const isControlled = value !== undefined;

    // Uncontrolled local state
    const [local, setLocal] = useState<string>(defaultValue ?? dataLabel ?? "");

    // Keep local in sync if defaultValue changes (rare)
    useEffect(() => {
        if (!isControlled) setLocal(defaultValue ?? dataLabel ?? "");
    }, [defaultValue, dataLabel, isControlled]);

    const selected = isControlled ? (value as string) : local;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const next = e.target.value;
        if (isControlled) {
            onChange?.(next);
        } else {
            setLocal(next);
            onChange?.(next);
        }
    };

    return (
        <fieldset className={`fieldset ${className}`}>
            <legend className="fieldset-legend">{label}</legend>
            <select
                className="select select-bordered text-black w-full"
                value={selected}
                onChange={handleChange}
                required={required}
            >
                {/* Placeholder option when nothing selected */}
                {placeholder !== undefined && (
                    <option value="" disabled hidden={!placeholder}>
                        {placeholder}
                    </option>
                )}

                {items.map((item) => (
                    <option key={item} value={item} className="text-black">
                        {item}
                    </option>
                ))}
            </select>
        </fieldset>
    );
};
