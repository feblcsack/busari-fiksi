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
        <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
        <p className="text-slate-500 text-sm mt-0.5">Kelola informasi akunmu</p>
      </div>
      <ProfileClient profile={profile} userEmail={user?.email ?? null} />
    </div>
  );
}
