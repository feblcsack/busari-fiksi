import { getProfile } from "@/actions/profile";
import { ProfileClient } from "@/components/profile/profile-client";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getProfile();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" style={{ backgroundColor: "#FFF8F3" }}>
      <div className="mb-6">
        <h1
          className="text-3xl md:text-4xl mb-2"
          style={{ color: "#201A14", fontFamily: "Libre Caslon Text, serif", fontWeight: 400, letterSpacing: "-0.02em" }}
        >
          Profil
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#867462" }}>Kelola informasi akunmu</p>
      </div>
      <ProfileClient profile={profile} userEmail={user?.email ?? null} />
    </div>
  );
}
