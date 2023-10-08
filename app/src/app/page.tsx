import { getServerSession } from "next-auth";

import { getNextAuthOptions } from "~/app/api/auth/[...nextauth]/route";
import ClientComponent from "~/app/_components/ClientComponent";
import { serverClient } from "~/app/_trpc/serverClient";

export default async function Home() {
  const users = await serverClient.getUsers();
  const x = await getServerSession(getNextAuthOptions());

  return (
    <main className="m-4 flex">
      {JSON.stringify(x)}
      <ClientComponent initialUsers={users} />
    </main>
  );
}
