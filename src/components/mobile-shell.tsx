"use client";

import { domAnimation, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

export function MobileShell({ children, scene = false }: { children: ReactNode; scene?: boolean }) {
  const reducedMotion = useReducedMotion();
  const classes = ["mobile-shell"];
  if (scene) {
    classes.push("mobile-shell--scene");
  }
  return (
    <LazyMotion features={domAnimation} strict>
      <m.main
        className={classes.join(" ")}
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.main>
    </LazyMotion>
  );
}
