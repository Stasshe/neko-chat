"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function MobileShell({ children, scene = false }: { children: ReactNode; scene?: boolean }) {
  const reducedMotion = useReducedMotion();
  const classes = ["mobile-shell"];
  if (scene) {
    classes.push("mobile-shell--scene");
  }
  return (
    <motion.main
      className={classes.join(" ")}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}
