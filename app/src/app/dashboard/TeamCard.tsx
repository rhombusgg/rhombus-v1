import { type Session } from "next-auth";

import { db } from "~/server/db";
import { generateInviteLink } from "~/lib/utils";

import { FaCrown } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/Avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import { Separator } from "~/components/ui/Separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/Tooltip";

import { InviteBar, KickUserButton, TeamNameBar } from "./TeamCardClient";

export async function TeamCard({ session }: { session: Session }) {
  const query = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      team: {
        select: {
          ownerId: true,
          name: true,
          inviteToken: true,
          users: {
            select: {
              id: true,
              name: true,
              discordUsername: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  const inviteLink = generateInviteLink(query!.team!.inviteToken);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
        <CardDescription>{query?.team?.name}</CardDescription>
      </CardHeader>
      <CardContent>
        {query?.team?.ownerId === session.user.id && (
          <>
            <h4 className="mb-2 text-sm font-medium">Team Name</h4>
            <TeamNameBar intialTeamName={query.team!.name!} />
            <Separator className="my-4" />
          </>
        )}
        <h4 className="text-sm font-medium">Invite Link</h4>
        <p className="mb-2 text-sm text-muted-foreground">
          Send this invite link to your team members
        </p>
        <InviteBar
          initialInviteLink={inviteLink}
          owner={query?.team?.ownerId === session.user.id}
        />
        <div className="mb-4" />
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-medium">
            Members ({query?.team?.users?.length}/4)
          </h4>
          <div className="grid gap-6">
            {query?.team?.users?.map((member, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.image!} />
                    <AvatarFallback>
                      {(member.name ?? member.email)
                        .match(/^([^@]{0,2})/)?.[0]
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="inline-flex items-center gap-1 text-sm font-medium leading-none">
                      <p>{member.name ?? member.email}</p>
                      {member.id === query?.team?.ownerId && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FaCrown className="inline-block h-4 w-4 cursor-pointer text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Team Captain</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <p>{member.id === session.user.id && "(You)"}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.discordUsername && `@${member.discordUsername}`}
                    </p>
                  </div>
                </div>
                {session.user.id === query?.team?.ownerId &&
                  session.user.id !== member.id && (
                    <KickUserButton
                      userId={member.id}
                      displayName={member.name ?? member.email}
                    />
                  )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
