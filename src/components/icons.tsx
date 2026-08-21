import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2,
  viewBox: "0 0 24 24",
};

export function MenuIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v11h14V10M9 21v-7h6v7" />
    </svg>
  );
}

export function ComposeIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

export function GroupsIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <path d="M7 11c2 0 3.5-1.8 3.5-4S9 3 7 3 3.5 4.8 3.5 7 5 11 7 11ZM17 11c2 0 3.5-1.8 3.5-4S19 3 17 3s-3.5 1.8-3.5 4S15 11 17 11ZM2 21v-3c0-2.2 2.2-4 5-4s5 1.8 5 4v3M12 21v-3c0-2.2 2.2-4 5-4s5 1.8 5 4v3" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" {...defaults} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
    </svg>
  );
}
