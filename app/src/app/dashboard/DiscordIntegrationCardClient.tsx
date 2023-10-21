"use client";

import { signIn } from "next-auth/react";

import { BsDiscord } from "react-icons/bs";
import { TbExternalLink } from "react-icons/tb";
import { Button } from "~/components/ui/Button";

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
