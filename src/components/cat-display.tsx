import Image from "next/image";

import { getCatImageSrc } from "@/lib/cat-assets";
import type { CatType, Emotion } from "@/types/app";

type CatDisplayProps = {
  type: CatType;
  emotion?: Emotion;
  className?: string;
  pose?: "sit" | "stand" | "lie";
  seed?: string;
  priority?: boolean;
};

export function CatDisplay({
  type,
  emotion = "neutral",
  pose = "sit",
  className,
  seed,
  priority = false,
}: CatDisplayProps) {
  const src = getCatImageSrc(type, emotion, pose, seed);
  const classes = className ? `cat-display ${className}` : "cat-display";

  return (
    <span className={classes}>
      <Image
        src={src}
        alt={`${type} cat`}
        width={256}
        height={256}
        draggable={false}
        priority={priority}
        className="cat-display__img"
      />
    </span>
  );
}
