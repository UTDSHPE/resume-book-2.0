import React from 'react';

interface NumberValidatorProps{
    min:number;
    max:number;
    className?:string;
    decimal?:boolean;
    headTitle?:string;
}

export const NumberValidator= ({min,max,className,decimal,headTitle}:NumberValidatorProps)=>{
    return(
        <div>
            <p className='text-black text-xs font-medium mb-2'>{headTitle}</p>
            <input type="number" className={`input validator text-black ${className}`} required placeholder={`${min}-${max}`}
                min={min} max={max}
                step={decimal?"any":undefined}
                title= {`Must be between ${min} to ${max}`} />
            <p className="validator-hint">Must be between {min} and {max}</p>
        </div>
    );
}
