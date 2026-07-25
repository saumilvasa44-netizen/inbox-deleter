import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInCard from "@/components/SignInCard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.accessToken) redirect("/clean");

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <SignInCard />
    </main>
  );
}
