import { z } from "zod";

// User type for authentication
export interface User {
  id: number;
  username: string;
  password: string;
}

export const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof userSchema>;

// Content section interface
export interface ContentSection {
  name: string;
  content: Record<string, any>;
}
