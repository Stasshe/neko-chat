import type { CatType, Emotion } from "@/types/app";

type CatDisplayProps = {
  type: CatType;
  emotion?: Emotion;
  pose?: "sit" | "stand" | "lie";
  className?: string;
};

const colors: Record<CatType, { body: string; patch: string }> = {
  white: { body: "#fffdfa", patch: "#fffdfa" },
  black: { body: "#4b4b4b", patch: "#4b4b4b" },
  mike: { body: "#fffdfa", patch: "#d98750" },
  sham: { body: "#efe4d2", patch: "#6d584f" },
  chatora: { body: "#e7ad55", patch: "#bf773c" },
};

function Face({ emotion }: { emotion: Emotion }) {
  if (emotion === "positive") {
    return <path d="M42 39q4 5 8 0m-18-2 3 2m27-2-3 2" />;
  }
  if (emotion === "negative") {
    return <path d="M42 43q4-5 8 0m-18-5 4-2m26 2-4-2" />;
  }
  if (emotion === "random") {
    return <path d="M43 38h.1m8 0h.1M44 44q3 2 6 0" />;
  }
  return <path d="M34 38q2 3 4 0m16 0q2 3 4 0M44 43q3 2 6 0" />;
}

export function CatDisplay({
  type,
  emotion = "neutral",
  pose = "sit",
  className,
}: CatDisplayProps) {
  const palette = colors[type];
  const label = `${type} cat`;

  if (pose === "lie") {
    return (
      <svg role="img" aria-label={label} className={className} viewBox="0 0 150 90">
        <g
          fill={palette.body}
          stroke="#343434"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        >
          <path d="M42 50c8-12 25-18 51-15 20 2 31 11 28 22-3 12-26 15-67 12-20-1-31-6-29-12 2-4 8-6 17-7Z" />
          <path d="M34 51 29 30l13 8 13-10 5 22" />
          <path d="M118 57c14 0 20-8 20-20" fill="none" />
          <path d="M72 68c16 8 40 8 60 4" fill="none" />
          {type === "mike" && <path d="m39 34 8 4-5 13-11-2Z" fill={palette.patch} stroke="none" />}
          <Face emotion={emotion} />
        </g>
      </svg>
    );
  }

  if (pose === "stand") {
    return (
      <svg role="img" aria-label={label} className={className} viewBox="0 0 130 100">
        <g
          fill={palette.body}
          stroke="#343434"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        >
          <path d="M38 49c16-10 46-10 62 0v30H38Z" />
          <path d="M39 51 34 28l13 8 12-11 7 25" />
          <path d="M42 76v15M59 77v14M84 77v14M99 75v16" />
          <path d="M99 57c20 0 21-16 15-24" fill="none" />
          {type === "mike" && <path d="m41 31 8 5-5 13-9-3Z" fill={palette.patch} stroke="none" />}
          {type === "chatora" && <path d="m71 50 4 10m9-9 4 10" fill="none" />}
          <Face emotion={emotion} />
        </g>
      </svg>
    );
  }

  return (
    <svg role="img" aria-label={label} className={className} viewBox="0 0 110 120">
      <g
        fill={palette.body}
        stroke="#343434"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      >
        <path d="M33 51 28 25l14 9 14-12 9 28" />
        <path d="M36 49c-9 12-10 35-2 51h42c7-15 5-38-4-51Z" />
        <path d="M41 76v26m24-26v26M31 101h50" />
        <path d="M76 78c19 8 27-5 24-23" fill="none" />
        {type === "mike" && <path d="m34 29 10 5-4 15-10-3Z" fill={palette.patch} stroke="none" />}
        {type === "sham" && <path d="M31 29h30l4 21H34Z" fill={palette.patch} stroke="none" />}
        {type === "chatora" && <path d="m46 57 4 13m10-13 4 13" fill="none" />}
        <Face emotion={emotion} />
      </g>
    </svg>
  );
}
