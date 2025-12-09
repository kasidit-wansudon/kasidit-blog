// src/lib/supabaseServer.ts
// Comment in English
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Cookies can only be modified in Server Actions or Route Handlers
          // In Server Components, we can only read cookies, not set them
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Silently ignore - this is expected in Server Components
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Silently ignore - this is expected in Server Components
          }
        },
      },
    }
  );
};
