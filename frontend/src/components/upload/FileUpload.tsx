// components/upload/FileUpload.tsx
import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { uploadToUserBucket } from "@/lib/uploads"; // adjust path to your uploads.ts

type Props = {
    maxSizeKB?: number;                 // default 300 KB
    onUploaded?: (url: string) => void; // optional callback when done
};

export const FileUpload: React.FC<Props> = ({ maxSizeKB = 300, onUploaded }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] ?? null;
        setUploadedUrl(null);
        setProgress(null);
        setError(null);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (!validTypes.includes(selectedFile.type)) {
            setError("Only PDF or DOCX files are allowed.");
            setFile(null);
            return;
        }

        if (selectedFile.size > maxSizeKB * 1024) {
            setError(`File must be under ${maxSizeKB} KB.`);
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            const uid = getAuth().currentUser?.uid;
            if (!uid) throw new Error("You must be signed in to upload.");

            // Keep original extension (ensure your Storage Rules allow both!)
            const ext = file.type === "application/pdf" ? "pdf" : "docx";

            const url = await uploadToUserBucket({
                path: `users/${uid}/resume.${ext}`,
                file,
                onProgress: (pct) => setProgress(Math.round(pct)),
                saveField: { field: "resumeUrl" },
            });

            setUploadedUrl(url);
            onUploaded?.(url);
        } catch (e: any) {
            setError(e?.message ?? "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <fieldset className="fieldset text-base-content">
                <legend className="fieldset-legend">Upload your resume</legend>

                <input
                    type="file"
                    className="file-input file-input-bordered w-full"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                <label className="label">
                    <span className="label-text">
                        Allowed: PDF or DOCX • Max size {maxSizeKB} KB
                    </span>
                </label>

                {/* Progress bar */}
                {uploading && (
                    <div className="mt-2">
                        <progress
                            className="progress progress-primary w-full"
                            value={progress ?? 0}
                            max={100}
                        />
                        <div className="mt-1 text-xs text-gray-600">
                            {progress !== null ? `${progress}%` : "Starting…"}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
                {uploadedUrl && !uploading && (
                    <div className="mt-2 text-sm text-green-600 break-all">
                        Upload complete. <a className="link" href={uploadedUrl} target="_blank" rel="noreferrer">View file</a>
                    </div>
                )}

                {/* Selected file */}
                {file && !uploading && (
                    <p className="mt-2 text-sm text-green-700">Selected: {file.name}</p>
                )}

                {/* Actions */}
                <div className="mt-3">
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <span className="loading loading-spinner mr-2" />
                                Uploading…
                            </>
                        ) : (
                            "Upload"
                        )}
                    </button>
                </div>
            </fieldset>
        </div>
    );
};
