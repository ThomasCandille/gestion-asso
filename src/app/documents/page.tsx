import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import {
  adminFolders,
  getAccessibleFolderKeys,
} from "@/features/documents/documents-rules";
import { DocumentsClient } from "@/features/documents/documents-client";

export default async function DocumentsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  const accessibleKeys = getAccessibleFolderKeys(session.role, session.poles);
  const accessibleFolders = adminFolders.filter((f) =>
    accessibleKeys.includes(f.key),
  );
  const canUpload = hasPermission(session.role, "documents:manage");

  return (
    <DocumentsClient
      accessibleFolders={accessibleFolders}
      canUpload={canUpload}
    />
  );
}
