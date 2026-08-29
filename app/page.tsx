import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Redireciona para o painel principal (Dashboard) que no seu sistema é a rota /admin
    redirect("/admin");
  } else {
    redirect("/login");
  }
}
