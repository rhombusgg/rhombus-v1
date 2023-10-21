"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { trpc } from "~/server/trpc/client";
import { generateInviteLink } from "~/lib/utils";

import { BiCopy } from "react-icons/bi";
import { BsXLg } from "react-icons/bs";
import { RxExit } from "react-icons/rx";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

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
                Reroll Token
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reroll the token and generate a new invite link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function TeamNameBar({ intialTeamName }: { intialTeamName: string }) {
  const updateTeamName = trpc.updateTeamName.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    name: string;
  }>();

  const onSubmit = handleSubmit(async ({ name }) => {
    await updateTeamName.mutateAsync({ name });
    toast.success("Updated team name");
  });

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="flex space-x-2">
      <div className="relative flex-grow">
        <div className="relative">
          <Input
            defaultValue={intialTeamName}
            {...register("name", {
              minLength: 3,
              maxLength: 50,
              required: true,
            })}
            className="overflow-ellipsis pr-10"
          />
          {errors.name && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute inset-y-0 right-3 flex cursor-pointer items-center">
                    <BsXLg className="h-4 w-4 text-destructive" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Team name must be between 3 and 50 characters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <Button variant="secondary" className="shrink-0" type="submit">
        Set Team Name
      </Button>
    </form>
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
