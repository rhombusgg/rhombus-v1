import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/nextauth";
import { serverClient } from "~/server/trpc/serverClient";

import { KanbanBoard } from "./client";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) redirect("/signin");

  const challenges = await serverClient(session).getChallenges();

  return (
    <main className="flex h-screen justify-center items-center">
      <KanbanBoard initialChallenges={challenges} />
    </main>
  );
}
