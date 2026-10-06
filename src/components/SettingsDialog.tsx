import { BookOpenCheck, Download, RotateCcw, ScrollText } from "lucide-react";
import { useState } from "react";
import { DialogFrame } from "./DialogFrame";

type SettingsDialogProps = {
  readCount: number;
  inProgressCount: number;
  favoriteCount: number;
  noteCount: number;
  onClose: () => void;
  onExportNotes: () => void;
  onOpenMethod: () => void;
  onResetReading: () => void;
};

export function SettingsDialog({
  readCount,
  inProgressCount,
  favoriteCount,
  noteCount,
  onClose,
  onExportNotes,
  onOpenMethod,
  onResetReading,
}: SettingsDialogProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <DialogFrame
      className="settings-dialog"
      title="Reader settings"
      description="This reading instrument stores progress and marginalia only in this browser."
      onClose={onClose}
    >
      <div className="settings-ledger" aria-label="Local reading ledger">
        <div>
          <span>Read</span>
          <strong>{readCount}</strong>
        </div>
        <div>
          <span>In progress</span>
          <strong>{inProgressCount}</strong>
        </div>
        <div>
          <span>Favourites</span>
          <strong>{favoriteCount}</strong>
        </div>
        <div>
          <span>Marginalia</span>
          <strong>{noteCount}</strong>
        </div>
      </div>

      <section className="settings-section" aria-labelledby="settings-portability">
        <div>
          <h2 id="settings-portability">Portability</h2>
          <p>Export marginalia as a JSON register you can keep or merge back into this reader.</p>
        </div>
        <button type="button" onClick={onExportNotes}>
          <Download aria-hidden="true" />
          Export marginalia
        </button>
      </section>

      <section className="settings-section" aria-labelledby="settings-method">
        <div>
          <h2 id="settings-method">Editorial method</h2>
          <p>Review the scope, representative-data caveat, sources, and relation model.</p>
        </div>
        <button type="button" onClick={onOpenMethod}>
          <ScrollText aria-hidden="true" />
          Open method
        </button>
      </section>

      <section className="settings-section is-danger" aria-labelledby="settings-reset">
        <div>
          <h2 id="settings-reset">Reading progress</h2>
          <p>Clear tale status, percentages, and favourites. Marginalia stays untouched.</p>
        </div>
        {confirmingReset ? (
          <div className="settings-confirm">
            <button
              className="is-destructive"
              type="button"
              onClick={() => {
                onResetReading();
                setConfirmingReset(false);
              }}
            >
              <RotateCcw aria-hidden="true" />
              Confirm reset
            </button>
            <button type="button" onClick={() => setConfirmingReset(false)}>Keep progress</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmingReset(true)}>
            <BookOpenCheck aria-hidden="true" />
            Reset reading
          </button>
        )}
      </section>
    </DialogFrame>
  );
}
