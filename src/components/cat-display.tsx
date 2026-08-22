import Image from "next/image";

import { getCatImageSrc } from "@/lib/cat-assets";
import type { CatType, Emotion } from "@/types/app";

type CatDisplayProps = {
  type: CatType;
  emotion?: Emotion;
  pose?: "sit" | "stand" | "lie";
  className?: string;
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
  const label = `${type} cat`;
  const wrapperClassName = className ? `cat-display ${className}` : "cat-display";
  const wrapperStyle = className ? undefined : { width: 72, height: 72 };

  return (
    <span className={wrapperClassName} style={wrapperStyle}>
      <Image
        src={src}
        alt={label}
        fill
        sizes="(max-width: 768px) 25vw, 96px"
        className="cat-display__image"
      />
    </span>
  );
}
