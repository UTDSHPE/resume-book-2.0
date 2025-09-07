import React from "react";

/* =========================
   Single checkbox
   ========================= */

interface CheckBoxProps {
    title: string;
    // Controlled:
    checked: boolean; // parent always passes this
    onChange: (checked: boolean) => void; // parent handles updates
}

export const CheckBox: React.FC<CheckBoxProps> = ({
    title,
    checked,
    onChange,
}) => {
    return (
        <div className="text-xs flex flex-col items-start">
            <span className="label-text text-black font-medium mb-2">{title}</span>
            <input
                type="checkbox"
                className="checkbox"
                checked={checked} // controlled: value always comes from parent
                onChange={(e) => onChange(e.target.checked)} // notify parent of new value
            />
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
    value: string[]; // parent passes full array of selected names
    onChange: (selected: string[]) => void; // parent handles updates
}

export const CheckBoxList: React.FC<CheckBoxListProps> = ({title,names,value,onChange,}) => {

    const toggle = (name: string) => {
        // compute the next selection from the current source of truth (value from parent)
        const next = value.includes(name)
            ? value.filter((n) => n !== name) // if the array already has that option, remove it
            : [...value, name]; // if it's not present, add name to array of currently selected

        // emit updated array back to parent
        onChange(next);
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
                        checked={value.includes(name)} // controlled: checked status comes from parent array
                        onChange={() => toggle(name)} // notify parent with updated array
                    />
                    <span className="label-text text-black text-xs ml-1 mb-[2px]">{name}</span>
                </label>
            ))}
        </div>
    );
};
