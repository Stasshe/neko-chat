"use client";

import { domMax, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { usePathname } from "next/navigation";
import { createContext, type ReactNode, use, useState } from "react";

const horizontalRoutes = new Set(["/home", "/groups"]);
type Direction = -1 | 0 | 1;

type TabTransitionContextValue = {
  direction: Direction;
  finishTransition: () => void;
  prepareTransition: (target: "/home" | "/groups") => void;
};

const TabTransitionContext = createContext<TabTransitionContextValue | null>(null);

function useTabTransition() {
  const value = use(TabTransitionContext);
  if (!value) {
    throw new Error("Tab transition components must be inside TabTransitionProvider.");
  }
  return value;
}

export function TabTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [direction, setDirection] = useState<Direction>(0);

  function prepareTransition(target: "/home" | "/groups") {
    let nextDirection: Direction = 0;
    if (pathname === "/home" && target === "/groups") {
      nextDirection = 1;
    } else if (pathname === "/groups" && target === "/home") {
      nextDirection = -1;
    }
    setDirection(nextDirection);
  }

  function finishTransition() {
    setDirection(0);
  }

  return (
    <TabTransitionContext value={{ direction, finishTransition, prepareTransition }}>
      {children}
    </TabTransitionContext>
  );
}

export function usePrepareTabTransition() {
  return useTabTransition().prepareTransition;
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { direction, finishTransition } = useTabTransition();
  const horizontal = horizontalRoutes.has(pathname) && direction !== 0 && !reducedMotion;

  let offset = 0;
  let initial: false | { x: string } = false;
  let duration = 0;
  if (horizontal) {
    offset = direction * 100;
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
        onAnimationComplete={finishTransition}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
