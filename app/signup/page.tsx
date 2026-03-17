import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function SignupPage() {
  const user = await getCurrentUser();

  // If user is already logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Redirect to onboarding as the signup flow
  redirect("/onboarding");
}
