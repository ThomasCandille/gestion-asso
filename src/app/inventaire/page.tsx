import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import { listInventoryItems } from "@/features/inventory/inventory-service";
import { InventoryClient } from "@/features/inventory/inventory-client";

export default async function InventairePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  const items = await listInventoryItems();
  const canManage = hasPermission(session.role, "inventory:manage");

  return <InventoryClient initialItems={items} canManage={canManage} />;
}
