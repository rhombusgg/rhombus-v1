import Image from "next/image";
import { type Session } from "next-auth";
import { BsCheck2, BsLink45Deg, BsPeopleFill } from "react-icons/bs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { LinkDiscordButton } from "~/components/page/LinkDiscordButton";
import { bot } from "~/server/bot";
import { serverClient } from "~/server/trpc/serverClient";

export async function DiscordIntegrationCard({
  session,
  inviteLink,
}: {
  session: Session;
  inviteLink: string;
}) {
  const guildPreview = await bot.guildPreview.query();
  const hasJoinedServer = await serverClient(session).userInServer();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discord Integration</CardTitle>
        <CardDescription>
          Join the discord server and link your account for support tickets,
          team linking, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-4 sm:border-l">
          <li className="mb-8">
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
              <h3 className="ml-6 font-medium leading-tight">
                Link your Discord account
              </h3>
            </div>
            <div className="sm:ml-6">
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
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-4 ring-background" />
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
            </div>
          </li>
          <li>
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
              <h3 className="ml-6 font-medium leading-tight">Join server</h3>
            </div>
            <a
              href={inviteLink}
              className="flex w-fit items-center rounded-md border border-input bg-background p-4 sm:ml-6"
            >
              <Image
                src={guildPreview.image}
                className="rounded-2xl"
                width={50}
                height={50}
                alt={`${guildPreview.name}'s icon`}
              />
              <div className="ml-4 hidden sm:inline-block">
                <div>{guildPreview.name}</div>
                <div className="inline-flex">
                  <div className="inline-flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />{" "}
                    {guildPreview.onlineCount} Online
                  </div>
                  <div className="ml-4 inline-flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-slate-500" />{" "}
                    {guildPreview.memberCount} Members
                  </div>
                </div>
              </div>
              {hasJoinedServer ? (
                <Button className="ml-8 bg-green-600" disabled>
                  Joined <BsCheck2 className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button className="ml-8 bg-green-600 hover:bg-green-600/90">
                  Join
                </Button>
              )}
            </a>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
