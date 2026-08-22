"use client";

import { domAnimation, type HTMLMotionProps, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

type ButtonVariant = "primary" | "logout";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "primary-button",
  logout: "logout-button",
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  const reducedMotion = useReducedMotion();
  const classes = [variantClassName[variant], className].filter(Boolean).join(" ");
  let tapAnimation = {};
  if (!reducedMotion && !props.disabled) {
    tapAnimation = { scale: 0.97 };
  }
  return (
    <LazyMotion features={domAnimation} strict>
      <m.button
        type={type}
        className={classes}
        {...props}
        whileTap={tapAnimation}
        transition={{ duration: 0.14 }}
      />
    </LazyMotion>
  );
}
