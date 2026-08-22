"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

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
    <motion.button
      type={type}
      className={classes}
      {...props}
      whileTap={tapAnimation}
      transition={{ duration: 0.14 }}
    />
  );
}
