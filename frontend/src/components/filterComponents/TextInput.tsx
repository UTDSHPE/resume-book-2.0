import React, { useState } from "react";
import { LuRefreshCw, LuCopy } from "react-icons/lu";
import axios from 'axios';
import { useAuth } from "@/app/context/AuthContext";
import { GenerateCode } from "../Code";

interface NameInputProps {
    label: string;
    required?: boolean;
}
interface codeInputProps{
    label:string;
    buttonLabel:string;
    subtext:string;
    onChange:(value:string)=>void;
    required?:boolean;
}
interface CodeGenerateProps{
    label:string,
    subtext:string;
}

export const NameInput = ({ label, required }: NameInputProps) => {
    const [error, setError] = React.useState<string | null>(null);

    // same regex as pattern attr
    const regex = /^[A-Za-z']+$/;

    return (
        <div className="w-full max-w-xs">
            <fieldset className="fieldset">
                <legend className="fieldset-legend text-base-content/100">{label}</legend>

                <input
                    type="text"
                    placeholder="Type here"
                    className={`
            input input-bordered w-full
            text-base-content/100 placeholder-base-content/60
            ${error ? "border-error focus:border-error focus:ring-error" : ""}
          `}
                    required={required}
                    pattern="[A-Za-z']+"
                    onInvalid={(e) => {
                        const target = e.target as HTMLInputElement;
                        let msg = "";
                        if (target.validity.valueMissing) {
                            msg = `${label} is required.`;
                        } else if (target.validity.patternMismatch) {
                            msg = "Only letters and apostrophes are allowed.";
                        }
                        target.setCustomValidity(msg);
                        setError(msg);
                    }}
                    onInput={(e) => {
                        const el = e.target as HTMLInputElement;
                        el.setCustomValidity("");

                        if (el.value === "" && required) {
                            setError(`${label} is required.`);
                        } else if (el.value && !regex.test(el.value)) {
                            setError("Only letters and apostrophes are allowed.");
                        } else {
                            setError(null);
                        }
                    }}
                />

                {/* Inline hint / error row */}
                <div className="label mt-1">
                    {error ? (
                        <span className="label-text-alt text-error">{error}</span>
                    ) : (
                        <span className="label-text-alt text-base-content/100">
                            {required ? "Required" : "Optional"}
                        </span>
                    )}
                </div>
            </fieldset>
        </div>
    );
};



const GenerateCodeButton = () => {
    const { user } = useAuth(); 
    const [loading, setLoading] = useState(false);
    const [code,setCode] = useState("");
    const [isCopied,setIsCopied] =useState(false);

    const handleGenerate = async () => {
        if (!user) throw new Error("No user signed in");

        const tokenResult = await user.getIdTokenResult();//Get values from token
        const idToken = tokenResult.token;                 // the actual JWT string
        const role = tokenResult.claims.role;              // your custom claim

        const invokeURL =
            process.env.NEXT_PUBLIC_API_GATEWAY_INVOKE_URL + "student/create-invite";

        const response = await axios.post(
            invokeURL,
            { uid: user.uid, role },
            { headers: { Authorization: `Bearer ${idToken}` } }
        );

        return response.data;
    };

    const handleClick = async () => {
        try {
            setLoading(true);
            const data = await handleGenerate();
            console.log("Invite created:", data);

            setCode(data.code); // Save the generated code into state
        } catch (err) {
            console.error("Error generating invite", err);
        } finally {
            setLoading(false);
        }
    };


    const handleCopyClick = async (textCopied:string)=>{
        try {
            await navigator.clipboard.writeText(textCopied);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset "Copied!" message after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Optionally, provide user feedback for failure
        }
    };

    return (
        <div className="flex flex-row">
            <button
                className="btn btn-square"
                onClick={handleClick}
                disabled={loading}
            >
                {loading ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <LuRefreshCw />
                )}
            </button>
            <fieldset>
                {code}
            </fieldset>
            <button
                className="btn btn-square"
                onClick={() => handleCopyClick(code)} // arrow functions call only on click
            >
                <LuCopy />
            </button>

        </div >
    );
};


export const CodeInput = ({label,required,buttonLabel,subtext,onChange}:codeInputProps) =>{
    const [code,setCode] = useState('');//init as empty
    const [error, setError] = React.useState<string | null>(null);
    const regex = /^[a-f0-9]+$/;

    return(
        <>
            <div className="card w-56 md:w-80 bg-base-100  card-sm md:card-md shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{label}</h2>
                    <p>{subtext}</p>
                    {/*Code Input Form Begin*/}
                    <div className='flex flex-row no-wrap'>
                        {/*Button to generate a code*/}
                        {/*text input */}
                        <div className="w-full max-w-xs">
                            <fieldset className="fieldset">
                                {/* */}
                                <input
                                    type="text"
                                    placeholder="Type here"
                                    className={`
                                    input input-bordered w-full
                                    text-base-content/100 placeholder-base-content/60
                                    ${error ? "border-error focus:border-error focus:ring-error" : ""}`}
                                    required={required}
                                    pattern="[a-f0-9']{64}^"//we generated a 256 bit long code, 32 bytes -> 2 hex characters per byte(4 bits per) = 64 hex characters
                                    onInvalid={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        let msg = "";
                                        if (target.validity.valueMissing) {
                                            msg = 'Enter code.';
                                        } else if (target.validity.patternMismatch) {
                                            msg = "Enter characters a-f or 0-9";
                                        }
                                        target.setCustomValidity(msg);
                                        setError(msg);
                                    }}
                                    onInput={(e) => {
                                        const el = e.target as HTMLInputElement;
                                        el.setCustomValidity("");

                                        if (el.value === "" && required) {
                                            setError(`${label} is required.`);
                                        } else if (el.value && !regex.test(el.value)) {
                                            setError("Enter characters a-f or 0-9.");
                                        } else {
                                            setError(null);
                                        }
                                    }}
                                    onChange={(e)=>onChange(e.target.value)}
                                    //convert event into its form value and pass it to our onChange function in the frontend access
                                />

                                {/* Inline hint / error row */}
                                <div className="label mt-1">
                                    {error ? (
                                        <span className="text-xs text-wrap md:text-sm label-text-alt text-error">{error}</span>
                                    ) : (
                                        <span className="label-text-alt text-base-content/100">
                                            {required ? "Required" : ""}
                                        </span>
                                    )}
                                </div>
                            </fieldset>
                        </div>
                        {/*End input for code field */}
                    </div>
                    <div className="justify-end card-actions">
                        <button className="mt-1 btn btn-primary mx-auto">{buttonLabel}</button>
                    </div>
                </div>
            </div>

        </>
    );
}



export const CodeOutput = ({ label, subtext }: CodeGenerateProps) => {
    return (
        <>
            <div className="card w-56 md:w-80 bg-base-100  card-sm md:card-md shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{label}</h2>
                    <p>{subtext}</p>
                    {/*Code Input Form Begin*/}
                    <div className='flex flex-row no-wrap'>
                        {/*Button to generate a code*/}
                        <GenerateCodeButton />

                    </div>
                </div>
            </div>
        </>
    );
}
