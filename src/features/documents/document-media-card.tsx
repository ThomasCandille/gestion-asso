import {
  ExternalLink,
  FileVideo,
  Image as ImageIcon,
} from "lucide-react";
import { formatModifiedDate, getMimeCategory, type DriveFile } from "./documents-rules";

type Props = { file: DriveFile };

export function MediaCard({ file }: Props) {
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
