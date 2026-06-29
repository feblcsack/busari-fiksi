import { getProfile } from "@/actions/profile";
import { ProfileClient } from "@/components/profile/profile-client";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getProfile();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1
            className="text-3xl md:text-4xl mb-2"
            style={{ color: "#e8e1dd", fontFamily: "Libre Caslon Text, serif", fontWeight: 400, letterSpacing: "-0.02em" }}
          >
            Profil
          </h1>
        <p className=" text-sm mt-0.5" style={{ color: "#9b8f7c" }}>Kelola informasi akunmu</p>
      </div>
      <ProfileClient profile={profile} userEmail={user?.email ?? null} />
    </div>
  );
}
