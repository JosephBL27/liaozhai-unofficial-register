import type { ComponentPropsWithoutRef } from "react";

export type MobileBottomSheetProps = ComponentPropsWithoutRef<"aside">;

export function MobileBottomSheet({ children, ...props }: MobileBottomSheetProps) {
  return (
    <aside data-responsive-surface="mobile-bottom-sheet" {...props}>
      {children}
    </aside>
  );
}
