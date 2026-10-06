import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace-main">Skip to current workspace</a>
      {children}
    </div>
  );
}
