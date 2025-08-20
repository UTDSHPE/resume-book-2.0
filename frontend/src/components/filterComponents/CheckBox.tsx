import React from 'react';
import {useState} from 'react';

interface CheckBoxProps {
    title: string;
    checked: boolean;                          // parent controls this
    onChange: (checked: boolean) => void;      // parent gets updates
}
interface CheckBoxListProps{
    title?:string;
    names:string[];
    onChange?:(selected:string[])=>void;//means function that takes a string array and returns nothing,as we are just modifying the state variables
}

export const CheckBox = ({ title, checked, onChange }: CheckBoxProps) => {
    return (
        <div className="text-xs flex flex-col items-start">
            {/* Title above */}
            <span className="label-text text-black font-medium mb-1">{title}</span>

            {/* Checkbox only */}
            <input
                type="checkbox"
                className="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </div>
    );
};

export const CheckBoxList = ({ title,names, onChange }: CheckBoxListProps) => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (name: string) => {
        setSelected((prev) => {//prev calls the function and gives the previous state of the variable as prev
            const isSelected = prev.includes(name);//checks if the string is present in previous state array, which means its selected
            const updated = isSelected ? prev.filter((n) => n !== name) // if it is present and its checked, remove it from state via filter
            : [...prev, name];//adds it by creating a new array w all the elements of prev + name
            onChange?.(updated); //call onChange function if it exists via optional chanining to refresh state array
            return updated;//return state array to internal state variable
            //onChange is the string arr we pass from frontend and the return is so we can keep track internally in the function
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="flex label cursor-pointer mb-2">
                <span className="label-text text-xs text-black font-medium">{title}</span>
            </label>
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