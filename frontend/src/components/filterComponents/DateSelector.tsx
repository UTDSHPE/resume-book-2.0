import React from 'react';

interface validatorProps{
    items: string [];
    label: string;
    required:boolean;
}

export const DateSelector= ({items,label,required}:validatorProps) => {
   
    return(
        <div>
            <input type="date" className="input validator" required placeholder="" 
            min="2000-01-01" max="2100-01-01"
            title="Must be valid URL" />
            <p className="validator-hint">Must be within the range</p>
        </div>
    );

}