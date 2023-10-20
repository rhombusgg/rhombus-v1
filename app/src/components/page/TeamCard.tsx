import { type Session } from "next-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import { FaCrown } from "react-icons/fa";
import { Separator } from "~/components/ui/Separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/Avatar";
import { InviteBar } from "./InviteBar";
import { db } from "~/server/db";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { BsTrash } from "react-icons/bs";
import { env } from "~/env.mjs";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team {query?.team?.name}</CardTitle>
        <CardDescription>Manage your team</CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-medium">Invite Link</h4>
        <p className="mb-2 text-sm text-muted-foreground">
          Send this invite link to your team members
        </p>
        <InviteBar
          inviteLink={`${env.NEXTAUTH_URL}/signin?token=${query?.team?.inviteToken}`}
        />
        <Separator className="my-4" />
        <div className="space-y-4">
          <h4 className="text-sm font-medium">
            Members ({query?.team?.users?.length}/4)
          </h4>
          <div className="grid gap-6">
            {query?.team?.users?.map((member, i) => (
              <div
                key={i}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.image ?? ""} />
                    <AvatarFallback>
                      {(member.name ? member.name : member.email!)
                        .substring(0, 2)
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
                {session.user.id === query?.team?.ownerId && (
                  <button>
                    <BsTrash className="h-4 w-4 text-destructive hover:text-destructive/90" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
