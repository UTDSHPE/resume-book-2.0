import React from 'react';

interface dropdownProps{
    items: string [];
    label: string;
    required:boolean;
}

export const DropDown = ({items,label,required}:dropdownProps) => {
    let requiredStr;
    if(required){
        requiredStr = "Required";
    }
    else{
        requiredStr = "Optional";
    }
    return(
        <fieldset className="fieldset">
            <legend className="fieldset-legend">{label}</legend>
            <select defaultValue={label} className="select">
                <option disabled={true}>{label}</option>
                <div>
                    {items.map(item =>(//map the string array input to be the options for the dropdown
                        <option key={item} >{item}</option>
                    ))}
                </div>
            </select>
            <span className="label">{requiredStr}</span>
        </fieldset>
    );

}