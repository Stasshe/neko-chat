import Image from "next/image";

import { getCatImageSrc } from "@/lib/cat-assets";
import type { CatType, Emotion } from "@/types/app";

type CatDisplayProps = {
  type: CatType;
  emotion?: Emotion;
  className?: string;
  pose?: "sit" | "stand" | "lie";
  seed?: string;
};

export function CatDisplay({
  type,
  emotion = "neutral",
  pose = "sit",
  className,
  seed,
}: CatDisplayProps) {
  const src = getCatImageSrc(type, emotion, pose, seed);
  const classes = className ? `cat-display ${className}` : "cat-display";

  return (
    <span className={classes}>
      <Image src={src} alt={`${type} cat`} fill sizes="200px" className="cat-display__img" />
    </span>
  );
}
