import { getServerSession } from "next-auth";

import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import ClientComponent from "~/app/_components/ClientComponent";
import { serverClient } from "~/app/_trpc/serverClient";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const users = await serverClient(session).getUsers();

  return (
    <main className="m-4 flex flex-col">
      {JSON.stringify(users)}
      {JSON.stringify(session)}
      <ClientComponent initialUsers={users} />
    </main>
  );
}
