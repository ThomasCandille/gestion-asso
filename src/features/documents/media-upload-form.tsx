"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { readApiError } from "@/lib/api";
import type { DriveFile } from "./documents-rules";

type Props = {
  onClose: () => void;
  onUploaded: (file: DriveFile) => void;
};

export function MediaUploadForm({ onClose, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { file: DriveFile };
      onUploaded(data.file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Fichier (image ou vidéo, max 50 Mo)
        </label>
        <div
          className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 transition hover:border-zinc-400 hover:bg-zinc-100"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <Upload className="h-8 w-8 text-zinc-400" aria-hidden />
          {selectedFile ? (
            <p className="mt-2 text-sm font-medium text-zinc-800">
              {selectedFile.name}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              Cliquer pour choisir un fichier
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isUploading ? "Envoi en cours…" : "Envoyer vers Drive"}
        </button>
      </div>
    </form>
  );
}
