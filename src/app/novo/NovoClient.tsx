"use client";

import { useRouter } from "next/navigation";
import NovoChamado from "@/components/nexus/NovoChamado";

export default function NovoClient() {
  const router = useRouter();
  return <NovoChamado onSuccess={() => router.push("/kanban")} />;
}
