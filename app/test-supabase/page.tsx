import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TestSupabasePage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(5);

  return (
    <pre className="p-4">
      {JSON.stringify({ data, error }, null, 2)}
    </pre>
  );
}