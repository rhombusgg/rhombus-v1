import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/nextauth";

import { AuthForm, Error, type RouterError } from "./client";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerAuthSession();

  const errors: RouterError[] = [];

  const token = searchParams.token;
  const team = token
    ? await db.team.findUnique({
        where: { inviteToken: token as string },
        select: {
          id: true,
          name: true,
          inviteToken: true,
          users: { select: { id: true } },
        },
      })
    : undefined;

  if (token && !team)
    errors.push({ text: "Invalid invite token", routerReplace: "/signin" });
  if (team && team.users.length >= 4)
    errors.push({
      text: `Team ${team.name} is full`,
      routerReplace: "/signin",
    });

  if (session) {
    if (team)
      await db.team.update({
        where: { id: team.id },
        data: { users: { connect: { id: session.user.id } } },
      });

    redirect("/dashboard");
  }

  return (
    <main className="flex h-screen justify-center">
      <div className="flex flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          {errors.length > 0 && <Error errors={errors} />}
          {team && <div>You&apos;re being invited to join {team.name}</div>}
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Authenticate below to create or join a team. Sign in with Discord to
            get rich feature integrations.
          </p>
        </div>
        <AuthForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Participation
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
