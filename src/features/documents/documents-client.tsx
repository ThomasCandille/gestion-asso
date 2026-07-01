"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  File,
  FileImage,
  FileText,
  FileVideo,
  FolderOpen,
  Image as ImageIcon,
  Plus,
  Presentation,
  Table,
} from "lucide-react";
import Link from "next/link";
import { Modal } from "@/lib/modal";
import { readApiError } from "@/lib/api";
import type { AdminFolder, DriveFile } from "./documents-rules";
import {
  formatFileSize,
  formatModifiedDate,
  getMimeCategory,
  mimeCategoryLabels,
} from "./documents-rules";
import { MediaUploadForm } from "./media-upload-form";

function FileMimeIcon({ mimeType }: { mimeType: string }) {
  const category = getMimeCategory(mimeType);
  const cls = "h-4 w-4 shrink-0";
  switch (category) {
    case "image":
      return <FileImage className={`${cls} text-violet-500`} aria-hidden />;
    case "video":
      return <FileVideo className={`${cls} text-blue-500`} aria-hidden />;
    case "pdf":
      return <FileText className={`${cls} text-red-500`} aria-hidden />;
    case "doc":
      return <FileText className={`${cls} text-blue-600`} aria-hidden />;
    case "sheet":
      return <Table className={`${cls} text-emerald-600`} aria-hidden />;
    case "slide":
      return <Presentation className={`${cls} text-amber-500`} aria-hidden />;
    default:
      return <File className={`${cls} text-zinc-400`} aria-hidden />;
  }
}

function FileRow({ file }: { file: DriveFile }) {
  return (
    <tr className="group transition hover:bg-zinc-50">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <FileMimeIcon mimeType={file.mimeType} />
          <span className="text-sm font-medium text-zinc-900">{file.name}</span>
        </div>
      </td>
      <td className="hidden px-4 py-2.5 text-xs text-zinc-500 sm:table-cell">
        {mimeCategoryLabels[getMimeCategory(file.mimeType)]}
      </td>
      <td className="hidden px-4 py-2.5 text-xs tabular-nums text-zinc-500 md:table-cell">
        {formatModifiedDate(file.modifiedTime)}
      </td>
      <td className="hidden px-4 py-2.5 text-xs tabular-nums text-zinc-500 lg:table-cell">
        {formatFileSize(file.size)}
      </td>
      <td className="px-4 py-2.5 text-right">
        <a
          href={file.webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 transition hover:text-blue-800 group-hover:opacity-100"
        >
          Ouvrir
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </td>
    </tr>
  );
}

function FolderSection({
  folder,
}: {
  folder: AdminFolder;
}) {
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

function MediaCard({ file }: { file: DriveFile }) {
  const category = getMimeCategory(file.mimeType);
  const isImage = category === "image";
  const isVideo = category === "video";

  return (
    <a
      href={file.webViewLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-zinc-100">
        {isImage && file.thumbnailLink ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.thumbnailLink}
            alt={file.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-400">
            {isVideo ? (
              <FileVideo className="h-10 w-10" aria-hidden />
            ) : (
              <ImageIcon className="h-10 w-10" aria-hidden />
            )}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
          <ExternalLink className="h-5 w-5 text-white opacity-0 drop-shadow transition group-hover:opacity-100" aria-hidden />
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium text-zinc-900">{file.name}</p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {formatModifiedDate(file.modifiedTime)}
        </p>
      </div>
    </a>
  );
}

type Tab = "docs" | "media";

type Props = {
  accessibleFolders: AdminFolder[];
  canUpload: boolean;
};

export function DocumentsClient({ accessibleFolders, canUpload }: Props) {
  const [tab, setTab] = useState<Tab>("docs");
  const [mediaFiles, setMediaFiles] = useState<DriveFile[] | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  async function loadMedia() {
    if (mediaFiles !== null) return;
    setIsLoadingMedia(true);
    setMediaError(null);
    try {
      const response = await fetch("/api/documents/files?folder=media");
      if (!response.ok) throw new Error(await readApiError(response));
      const data = (await response.json()) as { files: DriveFile[] };
      setMediaFiles(data.files);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setIsLoadingMedia(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    if (t === "media") loadMedia();
  }

  function handleUploaded(file: DriveFile) {
    setMediaFiles((prev) => (prev ? [file, ...prev] : [file]));
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Dashboard
            </Link>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            IIMPACT — Documents
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
            Documents & Médiathèque
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm w-fit">
          <button
            type="button"
            onClick={() => switchTab("docs")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              tab === "docs"
                ? "bg-zinc-950 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Documents administratifs
          </button>
          <button
            type="button"
            onClick={() => switchTab("media")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              tab === "media"
                ? "bg-zinc-950 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Médiathèque
          </button>
        </div>

        {/* Documents tab */}
        {tab === "docs" && (
          <div className="space-y-3">
            {accessibleFolders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
                <FolderOpen className="mx-auto h-8 w-8 text-zinc-300" aria-hidden />
                <p className="mt-3 font-medium text-zinc-700">
                  Aucun dossier accessible avec votre rôle.
                </p>
              </div>
            ) : (
              accessibleFolders.map((folder) => (
                <FolderSection key={folder.key} folder={folder} />
              ))
            )}
          </div>
        )}

        {/* Media tab */}
        {tab === "media" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">Médiathèque</h2>
                {mediaFiles !== null && (
                  <p className="text-sm text-zinc-500">
                    {mediaFiles.length}{" "}
                    {mediaFiles.length !== 1 ? "fichiers" : "fichier"}
                  </p>
                )}
              </div>
              {canUpload && (
                <button
                  type="button"
                  onClick={() => setShowUpload(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:translate-y-0"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Ajouter des médias
                </button>
              )}
            </div>

            {isLoadingMedia && (
              <div className="py-12 text-center text-sm text-zinc-400">
                Chargement des médias…
              </div>
            )}

            {mediaError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {mediaError}
              </p>
            )}

            {mediaFiles !== null && !isLoadingMedia && (
              <>
                {mediaFiles.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
                    <FileImage className="mx-auto h-8 w-8 text-zinc-300" aria-hidden />
                    <p className="mt-3 font-medium text-zinc-700">
                      Aucun média dans ce dossier.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {mediaFiles.map((f) => (
                      <MediaCard key={f.id} file={f} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {canUpload && (
        <Modal
          open={showUpload}
          title="Ajouter des médias"
          onClose={() => setShowUpload(false)}
        >
          <MediaUploadForm
            onClose={() => setShowUpload(false)}
            onUploaded={handleUploaded}
          />
        </Modal>
      )}
    </main>
  );
}
