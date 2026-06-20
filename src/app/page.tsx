"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Homepage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signin");
  }, [router]);

  return null;
}
