import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "logout";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "primary-button",
  logout: "logout-button",
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  const classes = [variantClassName[variant], className].filter(Boolean).join(" ");
  return <button type={type} className={classes} {...props} />;
}
