"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

import { BiCopy } from "react-icons/bi";
import { RxExit } from "react-icons/rx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { trpc } from "~/server/trpc/client";
import { generateInviteLink } from "~/lib/utils";
import { useRouter } from "next/navigation";

export function InviteBar({
  initialInviteLink,
  owner,
}: {
  initialInviteLink: string;
  owner: boolean;
}) {
  const [inviteLink, setInviteLink] = useState<string>(initialInviteLink);
  const rerollInvite = trpc.rerollInviteToken.useMutation();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Copied invite link to clipboard");
  };

  const reroll = async () => {
    const newInviteToken = await rerollInvite.mutateAsync();
    setInviteLink(generateInviteLink(newInviteToken));
    toast.success("Rerolled invite link");
  };

  return (
    <div className="flex space-x-2">
      <div className="relative flex-grow">
        <Input
          value={inviteLink}
          readOnly
          className="overflow-ellipsis pr-10"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="absolute inset-y-0 right-3 flex items-center hover:text-primary-foreground/90"
                onClick={() => void copyToClipboard()}
              >
                <BiCopy className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy invite link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {owner && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="shrink-0"
                onClick={() => void reroll()}
              >
                Reroll
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reroll the invite link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function KickUserButton({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  const kickUser = trpc.kickUser.useMutation();
  const router = useRouter();

  const kick = async () => {
    await kickUser.mutateAsync({ userId });
    toast.success(
      `Kicked ${displayName}. You may want to reroll the invite link if they were kicked for being malicious.`,
      { duration: 8000 },
    );

    router.refresh();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={() => void kick()}>
            <RxExit className="h-4 w-4 text-destructive hover:text-destructive/80" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Kick {displayName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
