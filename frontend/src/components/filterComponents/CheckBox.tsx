import React, { useEffect, useState } from "react";

/* =========================
   Single checkbox
   ========================= */

interface CheckBoxProps {
    title: string;
    // Controlled:
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    // Uncontrolled:
    defaultChecked?: boolean;
}

export const CheckBox: React.FC<CheckBoxProps> = ({
    title,
    checked,
    onChange,
    defaultChecked = false,
}) => {
    const isControlled = checked !== undefined;
    const [local, setLocal] = useState<boolean>(defaultChecked);
    // if defaultChecked changes later (rare), keep local in sync
    useEffect(() => { if (!isControlled) setLocal(defaultChecked); }, [defaultChecked, isControlled]);

    const isChecked = isControlled ? !!checked : local;

    const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.checked;
        if (isControlled) onChange?.(next);
        else { setLocal(next); onChange?.(next); }
    };

    return (
        <div className="text-xs flex flex-col items-start">
            <span className="label-text text-black font-medium mb-2">{title}</span>
            <input type="checkbox" className="checkbox" checked={isChecked} onChange={handle} />
        </div>
    );
};

/* =========================
   Checkbox list (multi-select)
   ========================= */

interface CheckBoxListProps {
    title?: string;
    names: string[];
    // Controlled:
    value?: string[];
    onChange?: (selected: string[]) => void;
    // Uncontrolled:
    defaultValue?: string[];
}

export const CheckBoxList: React.FC<CheckBoxListProps> = ({
    title,
    names,
    value,
    onChange,
    defaultValue = [],
}) => {
    const isControlled = value !== undefined;
    const [local, setLocal] = useState<string[]>(defaultValue);

    // keep local in sync if defaultValue changes and we're uncontrolled
    useEffect(() => { if (!isControlled) setLocal(defaultValue); }, [defaultValue, isControlled]);

    const selected = isControlled ? (value as string[]) : local;

    const toggle = (name: string) => {
        // compute the next selection from the current source of truth
        const next = selected.includes(name)
            ? selected.filter((n) => n !== name)
            : [...selected, name];

        if (isControlled) {
            onChange?.(next);
        } else {
            // use functional update to avoid stale state, and emit the fresh array
            setLocal((prev) => {
                const updated = prev.includes(name)
                    ? prev.filter((n) => n !== name)
                    : [...prev, name];
                onChange?.(updated);
                return updated;
            });
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {title && (
                <label className="flex label cursor-pointer mb-2">
                    <span className="label-text text-xs text-black font-medium">{title}</span>
                </label>
            )}
            {names.map((name) => (
                <label key={name} className="label cursor-pointer">
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={selected.includes(name)}
                        onChange={() => toggle(name)}
                    />
                    <span className="label-text text-black text-xs ml-1 mb-[2px]">{name}</span>
                </label>
            ))}
        </div>
    );
};
