"use client";

import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/Button";
import { Label } from "~/components/ui/Label";
import { Input } from "~/components/ui/Input";

import { BsDiscord } from "react-icons/bs";

export default function AuthForm() {
  return (
    <div className="grid gap-6">
      <Button
        variant="outline"
        type="button"
        onClick={() => void signIn("discord")}
      >
        <BsDiscord className="mr-2 h-4 w-4" />
        Discord
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with Email
          </span>
        </div>
      </div>
      <form>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
            />
          </div>
          <Button variant="outline">Sign in with Email</Button>
        </div>
      </form>
    </div>
  );
}
