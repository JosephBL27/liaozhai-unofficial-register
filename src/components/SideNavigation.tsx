import type { ComponentPropsWithoutRef } from "react";

type SideNavigationProps = ComponentPropsWithoutRef<"nav"> & {
  "aria-label": string;
};

export function SideNavigation({ children, ...props }: SideNavigationProps) {
  return <nav {...props}>{children}</nav>;
}
