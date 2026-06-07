import { LinkIcon } from "lucide-react";

// Render value sebagai link kalau dia URL (http/https), selain itu teks biasa.
export function MaybeLink({ value, className = "" }: { value: string; className?: string }) {
  const isUrl = /^https?:\/\//i.test(value.trim());

  if (isUrl) {
    return (
      <a
        href={value.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 text-blue-600 hover:underline break-all ${className}`}
      >
        <LinkIcon className="h-3.5 w-3.5 shrink-0" />
        {value.trim()}
      </a>
    );
  }

  return <span className={`break-words ${className}`}>{value}</span>;
}
