import { forwardRef } from "react";
import { ParchmentPanel, type ParchmentPanelProps } from "./ParchmentPanel";

export const DetailPanel = forwardRef<HTMLDivElement, ParchmentPanelProps>(
  function DetailPanel({ children, ...props }, ref) {
    return (
      <ParchmentPanel ref={ref} data-panel-kind="reading-detail" {...props}>
        {children}
      </ParchmentPanel>
    );
  },
);
