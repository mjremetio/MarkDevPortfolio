import path from "path";

export type UploadStrategy = "supabase" | "disk";

const hasSupabaseConfig =
  Boolean(process.env.SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

const strategy: UploadStrategy = hasSupabaseConfig ? "supabase" : "disk";

export const uploadStrategy = strategy;
export const isSupabaseUpload = strategy === "supabase";
export const isDiskUpload = strategy === "disk";
export const uploadsDir = path.join(process.cwd(), "public", "uploads");
