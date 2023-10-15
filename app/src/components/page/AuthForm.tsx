"use client";

import { signIn } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "~/components/ui/Dialog";
import { Button } from "~/components/ui/Button";
import { Label } from "~/components/ui/Label";
import { Input } from "~/components/ui/Input";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { BsCheck2, BsDiscord, BsXLg } from "react-icons/bs";

export default function AuthForm() {
  const [emailSent, setEmailSent] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    email: string;
  }>();
  const onSubmit = handleSubmit(async (data) => {
    setEmailDialogOpen(true);
    setEmail(data.email);
    await signIn("email", {
      email: data.email,
      redirect: false,
    });
    setEmailSent(true);
  });

  return (
    <>
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Sign In</DialogTitle>
            <DialogDescription>
              Check your email for a magic link to sign in with. When you get
              it, you can close this tab.
            </DialogDescription>
          </DialogHeader>
          <div className="inline-flex items-center justify-center">
            {emailSent ? (
              <BsCheck2 className="mr-2 h-4 w-4" />
            ) : (
              <CgSpinnerTwoAlt className="mr-2 h-4 w-4 animate-spin" />
            )}{" "}
            Sending sign-in email to {email}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={!emailSent}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        <form onSubmit={(event) => void onSubmit(event)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <div className="relative">
                <Input
                  {...register("email", {
                    required: true,
                    pattern: /\S+@\S+\.\S+/,
                  })}
                  placeholder="name@example.com"
                  //   autoComplete="email"
                  //   autoCapitalize="none"
                  //   autoCorrect="off"
                />
                {errors.email && (
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <BsXLg className="h-4 w-4 text-destructive" />
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline">
              Sign in with Email{" "}
              {emailSent && <BsCheck2 className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
