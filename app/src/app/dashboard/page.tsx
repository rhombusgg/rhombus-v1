import { redirect } from "next/navigation";
import { z } from "zod";
import { BsCheck2, BsLink45Deg, BsPeopleFill } from "react-icons/bs";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { LinkDiscordButton } from "~/components/page/LinkDiscordButton";
import { getServerAuthSession } from "~/server/nextauth";
import { serverClient } from "~/server/trpc/serverClient";

export default async function Dashboard() {
  const session = await getServerAuthSession();

  if (!session) redirect("/signin");

  const caller = serverClient(session);
  const hasJoinedServer = await caller.userInServer();

  return (
    <main className="flex h-screen items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Discord Integration</CardTitle>
          <CardDescription>
            Join the discord server and link your account for support tickets,
            team linking, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative ml-4 border-l">
            <li className="mb-8 ml-6">
              <div className="mb-4 flex items-center">
                <span
                  className={`absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background ${
                    session.user.discordId
                      ? "bg-green-200 dark:bg-green-900"
                      : "bg-accent"
                  }`}
                >
                  {session.user.discordId ? (
                    <BsCheck2 className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                  ) : (
                    <BsLink45Deg className="h-3.5 w-3.5 text-accent-foreground" />
                  )}
                </span>
                <h3 className="font-medium leading-tight">
                  Link your Discord account
                </h3>
              </div>
              {session.user.discordId ? (
                <div className="flex items-center">
                  <div className="relative">
                    <Image
                      src={session.user.image!}
                      className="rounded-full ring-2 ring-background"
                      width={50}
                      height={50}
                      alt={`${session.user.name}'s profile picture`}
                    />
                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-4 ring-background" />
                  </div>
                  <div className="ml-2">
                    <div>{session.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.user.discordUsername}
                    </div>
                  </div>
                </div>
              ) : (
                <LinkDiscordButton />
              )}
            </li>
            <li className="ml-6">
              <div className="mb-4 flex items-center">
                <span
                  className={`absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background ${
                    hasJoinedServer
                      ? "bg-green-200 dark:bg-green-900"
                      : "bg-accent"
                  }`}
                >
                  {hasJoinedServer ? (
                    <BsCheck2 className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                  ) : (
                    <BsPeopleFill className="h-3.5 w-3.5 text-accent-foreground" />
                  )}
                </span>
                <h3 className="font-medium leading-tight">Join server</h3>
              </div>
              {/* TODO: Add server invite code */}
              <DiscordInvite inviteCode="" disabled={hasJoinedServer} />
            </li>
          </ol>
        </CardContent>
      </Card>
    </main>
  );
}

async function DiscordInvite({
  inviteCode,
  disabled,
}: {
  inviteCode: string;
  disabled: boolean;
}) {
  let details:
    | {
        name: string;
        image: string;
        onlineCount: number;
        memberCount: number;
      }
    | undefined = undefined;

  try {
    const serverDetails = z
      .object({
        guild: z.object({
          id: z.string(),
          name: z.string(),
          icon: z.string(),
        }),
        approximate_member_count: z.number(),
        approximate_presence_count: z.number(),
      })
      .parse(
        await (
          await fetch(
            `https://discord.com/api/invites/${inviteCode}?with_counts=true`,
            { cache: "force-cache" },
          )
        ).json(),
      );

    details = {
      name: serverDetails.guild.name,
      image: `https://cdn.discordapp.com/icons/${serverDetails.guild.id}/${serverDetails.guild.icon}`,
      onlineCount: serverDetails.approximate_presence_count,
      memberCount: serverDetails.approximate_member_count,
    };
  } catch (e) {}

  details = {
    name: "Server",
    image: "https://cdn.discordapp.com/icons",
    onlineCount: 31,
    memberCount: 87,
  };

  return (
    <a
      href={`https://discord.gg/${inviteCode}`}
      className="flex w-fit items-center rounded-md border border-input bg-background p-4"
    >
      <Image
        src={details?.image ?? ""}
        className="rounded-2xl"
        width={50}
        height={50}
        alt={`${details?.name}'s icon`}
      />
      <div className="ml-2">
        <div>{details?.name}</div>
        <div className="inline-flex">
          <div className="inline-flex items-center">
            <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />{" "}
            {details?.onlineCount} Online
          </div>
          <div className="ml-4 inline-flex items-center">
            <div className="mr-2 h-2 w-2 rounded-full bg-slate-500" />{" "}
            {details?.memberCount} Members
          </div>
        </div>
      </div>
      {disabled ? (
        <Button className="ml-8" disabled>
          Joined <BsCheck2 className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button className="ml-8">Join</Button>
      )}
    </a>
  );
}
