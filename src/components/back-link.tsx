import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";

export function BackLink({ href, label = "戻る" }: { href: string; label?: string }) {
  return (
    <Link className="page-back" href={href} aria-label={label}>
      <ArrowLeftIcon />
      <span>{label}</span>
    </Link>
  );
}
