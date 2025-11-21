import path from "path";

export type UploadStrategy = "supabase" | "disk" | "database";

const hasSupabaseConfig =
  Boolean(process.env.SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

const isServerlessRuntime = Boolean(process.env.VERCEL);

const strategy: UploadStrategy = hasSupabaseConfig
  ? "supabase"
  : isServerlessRuntime
    ? "database"
    : "disk";

export const uploadStrategy = strategy;
export const isSupabaseUpload = strategy === "supabase";
export const isDiskUpload = strategy === "disk";
export const isDatabaseUpload = strategy === "database";
export const uploadsDir = path.join(process.cwd(), "public", "uploads");
