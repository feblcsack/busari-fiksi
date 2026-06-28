import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { getProfile } from "@/actions/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const profile = await getProfile();

  return (
    <div className="min-h-full flex flex-col {`${caslon.variable} ${hanken.variable} font-sans bg-[#151311] text-[#e8e1dd] antialiased`}">
      <Navbar profile={profile} />
      {/* offset for fixed navbar: desktop 64px, mobile ~112px */}
      <main className="flex-1 pt-16 sm:pt-16">
        {children}
      </main>
    </div>
  );
}
