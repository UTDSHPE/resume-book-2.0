import { z } from "zod";

export const UserDocSchema = z.object({
    role: z.enum(["student", "recruiter", "admin"]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    utdEmail:z.string().email().optional(),
    email: z.string().email().optional(),
    profilePhotoUrl: z.string().url().optional(),
    resumeUrl: z.string().url().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
});
export type UserDoc = z.infer<typeof UserDocSchema>;
