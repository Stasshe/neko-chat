"use client";

import { domAnimation, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

export function MobileShell({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <LazyMotion features={domAnimation} strict>
      <m.main
        className="mobile-shell"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.main>
    </LazyMotion>
  );
}
