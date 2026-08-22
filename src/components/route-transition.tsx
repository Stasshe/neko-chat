"use client";

import { domMax, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const horizontalRoutes = new Set(["/home", "/groups"]);

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const horizontal = horizontalRoutes.has(pathname) && !reducedMotion;
  let offset = 0;
  let initial: false | { x: string } = false;
  let duration = 0;
  if (horizontal) {
    offset = -100;
    if (pathname === "/groups") {
      offset = 100;
    }
    initial = { x: `${offset}%` };
    duration = 0.32;
  }

  return (
    <LazyMotion features={domMax} strict>
      <m.div
        key={pathname}
        className="route-transition"
        initial={initial}
        animate={{ x: 0 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
