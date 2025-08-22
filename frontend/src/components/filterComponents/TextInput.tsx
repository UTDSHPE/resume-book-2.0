import React from "react";

interface NameInputProps {
    label: string;
    required?: boolean;
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
