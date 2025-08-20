import React from 'react';
import {useState} from 'react';

interface dropdownProps{
    items: string [];
    label: string;
    dataLabel:string
    className?:string;
    onChange?:(selected:string)=>void
}

export const DropDown = ({items,label,dataLabel,className}:dropdownProps) => {
    const [option,setOption] = useState<string>("");
    
    return(
        <fieldset className={`fieldset ${className}`}>
            <legend className="fieldset-legend">{label}</legend>
            <select defaultValue={dataLabel} className="select text-black">
                <option disabled={true}>{""}</option>
                    {items.map(item =>(//map the string array input to be the options for the dropdown
                        <option key={item} className='text-black'>{item}</option>
                    ))}
            </select>
        </fieldset>
    );

}