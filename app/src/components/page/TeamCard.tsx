import { type Session } from "next-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";

export function TeamCard({ session }: { session: Session }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>Manage your team</CardDescription>
      </CardHeader>
      <CardContent>{session.user.name}</CardContent>
    </Card>
  );
}
