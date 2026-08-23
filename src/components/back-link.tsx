import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";

export function BackLink({
  href,
  label = "戻る",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  const classes = ["page-back", className].filter(Boolean).join(" ");

  return (
    <Link className={classes} href={href} aria-label={label}>
      <ArrowLeftIcon />
      <span>{label}</span>
    </Link>
  );
}
