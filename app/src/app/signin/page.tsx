import { getServerAuthSession } from "~/server/nextauth";

import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "~/components/page/AuthForm";

export default async function SignIn() {
  const session = await getServerAuthSession();

  if (session) redirect("/dashboard");

  return (
    <main className="flex h-screen justify-center">
      <div className="flex flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Authenticate below to create or join a team. Sign in with Discord to
            get rich feature integrations.
          </p>
        </div>
        <AuthForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Participation
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
