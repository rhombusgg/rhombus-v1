import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/nextauth";

import { DiscordIntegrationCard } from "~/components/page/DiscordIntegrationCard";
import { TeamCard } from "~/components/page/TeamCard";

export default async function Dashboard() {
  const session = await getServerAuthSession();
  if (!session) redirect("/signin");

  const inviteLink = "https://discord.gg/yXSpMeqy";

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="grid items-start justify-center gap-6 rounded-lg p-8 lg:grid-cols-2">
        <div className="w-full">
          <TeamCard session={session} />
        </div>
        <div className="w-full">
          <DiscordIntegrationCard session={session} inviteLink={inviteLink} />
        </div>
      </div>
    </main>
  );
}
