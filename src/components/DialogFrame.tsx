import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";

let dialogReturnFocus: HTMLElement | null = null;

type DialogFrameProps = {
  title: string;
  className?: string;
  onClose: () => void;
  children: ReactNode;
  description?: string;
};

export function DialogFrame({ title, className = "", onClose, children, description }: DialogFrameProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `dialog-title-${useId().replace(/:/g, "")}`;
  const descriptionId = `dialog-description-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const activeElement = document.activeElement;
    if ((!dialogReturnFocus || !dialogReturnFocus.isConnected) && activeElement instanceof HTMLElement) {
      dialogReturnFocus = activeElement;
    }
    if (!dialog.open) dialog.showModal();
    return () => {
      window.setTimeout(() => {
        if (document.querySelector("dialog[open]")) return;
        if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus();
        dialogReturnFocus = null;
      }, 0);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`dialog-frame ${className}`.trim()}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <header>
        <div>
          <h1 id={titleId}>{title}</h1>
          {description && <p id={descriptionId}>{description}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`}>
          <X aria-hidden="true" />
        </button>
      </header>
      {children}
    </dialog>
  );
}
