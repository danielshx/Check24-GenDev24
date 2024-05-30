import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MatchesList } from "./list";
import { validateToken } from "@/lib/session";

export default async function MatchesPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
    return null;
  }

  try {
    const userId = validateToken(token);
  
    if (!userId) {
      redirect("/login");
      return null;
    }

    return <MatchesList userId={userId as number} />;
  } catch (error) {
    redirect("/login");
    return null;
  }
}

