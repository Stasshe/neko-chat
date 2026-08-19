import type { ReactNode } from "react";

export function MobileShell({ children, scene = false }: { children: ReactNode; scene?: boolean }) {
  const classes = ["mobile-shell"];
  if (scene) {
    classes.push("mobile-shell--scene");
  }
  return <main className={classes.join(" ")}>{children}</main>;
}
