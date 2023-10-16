"use client";

import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/Button";
import { BsDiscord } from "react-icons/bs";

export function LinkDiscordButton() {
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => void signIn("discord")}
    >
      <BsDiscord className="mr-2 h-4 w-4" />
      Link Discord
    </Button>
  );
}
