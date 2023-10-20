"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export type RouterError = {
  text: string;
  routerReplace?: undefined | string;
};

export function Error({ errors }: { errors: RouterError[] }) {
  const router = useRouter();

  useEffect(() => {
    errors.forEach((error) => {
      if (error.routerReplace) router.replace(error.routerReplace);
      toast.error(error.text, { id: error.text });
    });
  });
  return <></>;
}
