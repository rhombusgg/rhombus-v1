import { Separator } from "~/components/ui/Separator";

import { SidebarNav } from "./client";

const sidebarNavItems = [
  {
    title: "Discord",
    href: "/admin/discord",
  },
  {
    title: "Divisions",
    href: "/admin/divisions",
  },
  {
    title: "Challenges",
    href: "/admin/challenges",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage the CTF</p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
