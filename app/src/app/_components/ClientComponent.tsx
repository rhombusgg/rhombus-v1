"use client";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

import { serverClient } from "~/app/_trpc/serverClient";
import { trpc } from "~/app/_trpc/client";

export default function ClientComponent({
  initialUsers: initalTodos,
}: {
  initialUsers: Awaited<ReturnType<(typeof serverClient)["getUsers"]>>;
}) {
  const { data: session } = useSession();

  const users = trpc.getUsers.useQuery(undefined, {
    initialData: initalTodos,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const botExample = trpc.botExample.useMutation();

  return (
    <div>
      <div>{JSON.stringify(session)}</div>
      <div>{JSON.stringify(users.data, undefined)}</div>
      <button onClick={() => signIn("discord")}>Sign In with Discord</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => botExample.mutate()}>Bot Example</button>
    </div>
  );
}
