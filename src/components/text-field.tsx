import type { ComponentPropsWithoutRef } from "react";

type TextFieldProps = Pick<
  ComponentPropsWithoutRef<"input">,
  "maxLength" | "placeholder" | "type"
> & {
  id: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  value: string;
  onChange: (value: string) => void;
};

export function TextField({
  id,
  label,
  hideLabel = false,
  labelClassName,
  value,
  onChange,
  ...inputProps
}: TextFieldProps) {
  const resolvedLabelClassName = labelClassName ?? (hideLabel ? "sr-only" : "field-label");
  return (
    <>
      <label className={resolvedLabelClassName} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </>
  );
}
