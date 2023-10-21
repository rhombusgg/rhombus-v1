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
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/Avatar";
import { TbExternalLink } from "react-icons/tb";

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
              <h3 className="ml-7 font-medium leading-tight">
                Link your Discord account
              </h3>
            </div>
            <div className="sm:ml-6">
              {session.user.discordId ? (
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={session.user.image!} />
                    <AvatarFallback>
                      {(session.user.name ?? session.user.email!)
                        .match(/^([^@]{0,2})/)?.[0]
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{session.user.discordUsername}
                    </p>
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
              <h3 className="ml-7 font-medium leading-tight">Join server</h3>
            </div>
            <div className="flex w-fit items-center sm:ml-6">
              <Image
                src={guildPreview.image}
                className="rounded-xl"
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
                  <a className="inline-flex items-center" href={inviteLink}>
                    Join <TbExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
