import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import { NotesDrawer, type NoteView } from "../components/NotesDrawer";
import { firstTale } from "./catalogFixtures";

const stableNotes: NoteView[] = [
  {
    id: "note-fox-laughter",
    context: `${firstTale.title} · record`,
    text: "The laugh begins as evidence others try to discipline, then becomes the tale’s test of who can recognize a person without mastering her strangeness.",
    updatedAt: "2026-08-06T02:10:00.000Z",
  },
  {
    id: "note-garden-threshold",
    context: `${firstTale.title} · analysis`,
    text: "Return to the garden threshold when comparing kinship with the examination and yamen registers.",
    updatedAt: "2026-08-06T02:18:00.000Z",
  },
];

function NotesHarness({ populated = false }: { populated?: boolean }) {
  const [notes, setNotes] = useState<NoteView[]>(populated ? stableNotes : []);
  return (
    <NotesDrawer
      contextLabel={firstTale.title}
      notes={notes}
      onClose={fn()}
      onSave={(text) => setNotes((current) => [
        ...current,
        {
          id: `note-${current.length + 1}`,
          context: `${firstTale.title} · record`,
          text,
          updatedAt: "2026-08-06T02:30:00.000Z",
        },
      ])}
      onDelete={(id) => setNotes((current) => current.filter((note) => note.id !== id))}
      onExport={fn()}
      onImport={fn()}
    />
  );
}

const notesMeta = {
  title: "Overlays/Private Marginalia",
  component: NotesDrawer,
  tags: ["autodocs"],
  args: {
    contextLabel: firstTale.title,
    notes: [],
    onClose: fn(),
    onSave: fn(),
    onDelete: fn(),
    onExport: fn(),
    onImport: fn(),
  },
} satisfies Meta<typeof NotesDrawer>;

export default notesMeta;
type NotesStory = StoryObj<typeof notesMeta>;

export const EmptyNotes: NotesStory = {
  render: () => <NotesHarness />,
};

export const PopulatedNotes: NotesStory = {
  render: () => <NotesHarness populated />,
};
