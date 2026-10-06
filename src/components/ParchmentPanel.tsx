import { forwardRef, type ComponentPropsWithoutRef } from "react";

export type ParchmentPanelProps = ComponentPropsWithoutRef<"div">;

export const ParchmentPanel = forwardRef<HTMLDivElement, ParchmentPanelProps>(
  function ParchmentPanel({ children, ...props }, ref) {
    return <div ref={ref} {...props}>{children}</div>;
  },
);
