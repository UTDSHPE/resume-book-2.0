// types/profile.ts
export type Availability = "Full-time" | "Internship";
export type GradSemester = "Spring" | "Fall" | null;

export type ProfileForm = {
    firstName: string;
    lastName: string;
    email: string;
    utdEmail: string;
    phone: string;
    gpa: number | null;
    gradYear: number | null;
    major: string;
    gradSemester: GradSemester;
    availability: Availability[];
    workAuthorized: boolean;
    profilePhoto: string | null;
    resumeUrl: string | null;
};
