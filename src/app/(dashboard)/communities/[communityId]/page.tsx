import { Overview } from "./overview";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateToken } from "@/lib/session";

export default function CommunitiesPage() {
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
    return <Overview userId={userId as number} />;
  } catch (error) {
    redirect("/login");
    return null;
  }
}
