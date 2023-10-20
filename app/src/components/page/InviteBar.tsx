"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

import { BiCopy } from "react-icons/bi";

export function InviteBar({ inviteLink }: { inviteLink: string }) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Copied invite link to clipboard");
  };

  return (
    <div className="flex space-x-2">
      <div className="relative flex-grow">
        <Input value={inviteLink} readOnly />
        <button
          className="absolute inset-y-0 right-3 flex items-center hover:text-primary-foreground/90"
          onClick={() => void copyToClipboard()}
        >
          <BiCopy className="h-4 w-4" />
        </button>
      </div>
      <Button variant="secondary" className="shrink-0">
        Reroll
      </Button>
    </div>
  );
}
