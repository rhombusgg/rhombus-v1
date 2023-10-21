"use client";

import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/Button";
import { BsDiscord } from "react-icons/bs";
import { TbExternalLink } from "react-icons/tb";

export function LinkDiscordButton() {
  return (
    <Button
      variant="secondary"
      className="space-x-2"
      onClick={() => void signIn("discord")}
    >
      <BsDiscord className="h-4 w-4" />
      <span>Link Discord</span>
      <TbExternalLink className="h-4 w-4" />
    </Button>
  );
}
