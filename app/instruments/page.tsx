import { createClient } from "@/lib/supabase/server";

export default async function Instruments() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select("*");
  console.log(instruments);

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}
