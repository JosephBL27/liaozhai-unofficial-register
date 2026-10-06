import type { ComponentPropsWithoutRef } from "react";

type FilterToolbarProps = ComponentPropsWithoutRef<"section"> & {
  "aria-label": string;
};

export function FilterToolbar({ children, ...props }: FilterToolbarProps) {
  return <section {...props}>{children}</section>;
}
