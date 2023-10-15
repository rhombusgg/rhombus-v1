import { getServerAuthSession } from "~/server/nextauth";

import ClientComponent from "~/components/ClientComponent";
import { serverClient } from "~/server/trpc/serverClient";

export default async function Home() {
  const session = await getServerAuthSession();
  const users = await serverClient(session).getUsers();

  return (
    <main className="m-4 flex flex-col">
      {JSON.stringify(users)}
      {JSON.stringify(session)}
      <ClientComponent initialUsers={users} />
    </main>
  );
}
