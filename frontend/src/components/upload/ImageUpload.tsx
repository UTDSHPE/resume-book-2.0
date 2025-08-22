"use client";
import React, { useState } from "react";
import { Camera } from "lucide-react";

interface ProfilePhotoProps {
    photo: string | null; // keep this as a string (URL or base64), not File
    setPhoto: (photo: string | null) => void;
}

export const ProfilePhoto = ({ photo, setPhoto }: ProfilePhotoProps) => {
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (max 1 MB )
        const maxSize = 1 * 1024 * 1024;
        if (file.size > maxSize) {
            setError("File size must be less than 1MB.");
            return;
        }

        // Validate type (JPEG, PNG, WEBP only)
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            setError("Only JPEG, PNG, or WEBP images are allowed.");
            return;
        }

        //Clear errors and create preview
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string); // store DataURL in parent
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative group w-32 h-32">
                <img
                    src={photo || "/site-assets/default-pfp.png"} // fallback to default
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-2 border-black/50"
                />

                {/* Hover overlay */}
                <label
                    htmlFor="fileInput"
                    className="absolute inset-0 bg-black/50 rounded-full 
                     flex items-center justify-center text-white 
                     opacity-0 group-hover:opacity-100 cursor-pointer transition"
                >
                    <Camera size={28} />
                </label>

                {/* File input */}
                <input
                    id="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Error message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};
