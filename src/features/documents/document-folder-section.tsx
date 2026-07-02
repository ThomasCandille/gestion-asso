"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { readApiError } from "@/lib/api";
import type { AdminFolder, DriveFile } from "./documents-rules";
import { FileRow } from "./document-file-row";

type Props = { folder: AdminFolder };

export function FolderSection({ folder }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<DriveFile[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    if (files !== null) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/documents/files?folder=${encodeURIComponent(folder.key)}`,
      );
      if (!response.ok) throw new Error(await readApiError(response));
      const data = (await response.json()) as { files: DriveFile[] };
      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-zinc-50"
      >
        <div className="flex items-center gap-2.5">
          <FolderOpen className="h-4 w-4 text-amber-500" aria-hidden />
          <span className="font-medium text-zinc-900">{folder.label}</span>
          {files !== null && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
              {files.length}
            </span>
          )}
        </div>
        {isLoading ? (
          <span className="text-xs text-zinc-400">Chargement…</span>
        ) : isOpen ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
        )}
      </button>

      {error && (
        <p className="border-t border-zinc-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isOpen && files !== null && (
        <div className="border-t border-zinc-100">
          {files.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-400">
              Aucun fichier dans ce dossier.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-2">Nom</th>
                    <th className="hidden px-4 py-2 sm:table-cell">Type</th>
                    <th className="hidden px-4 py-2 md:table-cell">Modifié</th>
                    <th className="hidden px-4 py-2 lg:table-cell">Taille</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {files.map((f) => (
                    <FileRow key={f.id} file={f} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
