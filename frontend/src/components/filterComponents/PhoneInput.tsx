'use client'
import React from 'react';
interface PhoneInputProps{
    label:string;
}
export const PhoneInput=({label}:PhoneInputProps)=>{
    return(
        <div className='text-base-content'>
            <p className=' text-xs font-medium mb-2'>{label}</p>
            <input type="tel" className="input validator tabular-nums" required placeholder="Phone"
                pattern="[0-9]*" minLength={10} maxLength={10} title="Must be 10 digits" />
            <p className="validator-hint">Must be 10 digits</p>
        </div>
    );
}