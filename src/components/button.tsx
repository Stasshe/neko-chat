"use client";

import { domAnimation, type HTMLMotionProps, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

import { ButtonSpinner } from "@/components/button-spinner";

type ButtonVariant = "primary" | "logout";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: ButtonVariant;
  pending?: boolean;
  children?: ReactNode;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "primary-button",
  logout: "logout-button",
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  pending = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const reducedMotion = useReducedMotion();
  const classes = [variantClassName[variant], className].filter(Boolean).join(" ");
  const isDisabled = disabled || pending;
  let tapAnimation = {};
  if (!reducedMotion && !isDisabled) {
    tapAnimation = { scale: 0.97 };
  }
  return (
    <LazyMotion features={domAnimation} strict>
      <m.button
        type={type}
        className={classes}
        {...props}
        disabled={isDisabled}
        aria-busy={pending}
        whileTap={tapAnimation}
        transition={{ duration: 0.14 }}
      >
        {pending && <ButtonSpinner />}
        {children}
      </m.button>
    </LazyMotion>
  );
}
