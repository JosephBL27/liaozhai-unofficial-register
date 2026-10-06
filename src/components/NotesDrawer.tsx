import { Download, FileUp, Save, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { DialogFrame } from "./DialogFrame";

export type NoteView = {
  id: string;
  context: string;
  text: string;
  updatedAt: string;
};

type NotesDrawerProps = {
  contextLabel: string;
  notes: NoteView[];
  onClose: () => void;
  onSave: (text: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
};

export function NotesDrawer({
  contextLabel,
  notes,
  onClose,
  onSave,
  onDelete,
  onExport,
  onImport,
}: NotesDrawerProps) {
  const [draft, setDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <DialogFrame
      className="notes-dialog"
      title="Private marginalia"
      description="Notes stay in this browser unless you export them."
      onClose={onClose}
    >
      <section className="note-composer">
        <label htmlFor="note-draft">Add a note to {contextLabel}</label>
        <textarea
          id="note-draft"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          placeholder="What changed in your reading?"
          rows={6}
        />
        <button
          className="seal-action"
          type="button"
          disabled={!draft.trim()}
          onClick={() => {
            onSave(draft.trim());
            setDraft("");
          }}
        >
          <Save aria-hidden="true" /> Save marginalia
        </button>
      </section>

      <section className="notes-ledger" aria-labelledby="saved-notes-title">
        <header>
          <h2 id="saved-notes-title">Saved notes</h2>
          <div>
            <button type="button" onClick={onExport}><Download aria-hidden="true" /> Export</button>
            <button type="button" onClick={() => fileRef.current?.click()}><FileUp aria-hidden="true" /> Import</button>
            <input
              ref={fileRef}
              className="sr-only"
              type="file"
              accept="application/json"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) onImport(file);
                event.currentTarget.value = "";
              }}
            />
          </div>
        </header>
        {notes.length ? (
          <ol>
            {notes.map((note) => (
              <li key={note.id}>
                <span>{note.context}</span>
                <p>{note.text}</p>
                <small>{new Date(note.updatedAt).toLocaleString()}</small>
                <button type="button" onClick={() => onDelete(note.id)} aria-label={`Delete note: ${note.text.slice(0, 30)}`}>
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className="dialog-empty"><strong>No marginalia yet.</strong><p>Your first note will appear here.</p></div>
        )}
      </section>
    </DialogFrame>
  );
}
