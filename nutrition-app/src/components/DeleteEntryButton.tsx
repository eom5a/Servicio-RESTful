"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteEntryButton({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este registro?")) return;
    setDeleting(true);
    await fetch(endpoint, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting}>
      <Trash2 className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
}
