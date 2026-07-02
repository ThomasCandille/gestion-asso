import {
  ExternalLink,
  File,
  FileImage,
  FileText,
  FileVideo,
  Presentation,
  Table,
} from "lucide-react";
import {
  formatFileSize,
  formatModifiedDate,
  getMimeCategory,
  mimeCategoryLabels,
  type DriveFile,
} from "./documents-rules";

export function FileMimeIcon({ mimeType }: { mimeType: string }) {
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

export function FileRow({ file }: { file: DriveFile }) {
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
