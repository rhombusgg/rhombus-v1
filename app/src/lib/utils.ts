import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "~/env.mjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateInviteLink = (inviteToken: string) =>
  `${env.NEXT_PUBLIC_LOCATION_URL}/signin?token=${inviteToken}`;
