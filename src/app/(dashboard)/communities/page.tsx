import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateToken } from "@/lib/session";
import { CommunitesOverview } from "./overview";

export default function CommunitiesOverviewPage() {
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
    return <CommunitesOverview userId={userId as number} />;
  } catch (error) {
    redirect("/login");
    return null;
  }
}
