import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import { ReadingDossier } from "../components/ReadingDossier";
import type { TaleReadingState } from "../lib/readingState";
import { dossierFor, firstRegister, firstTale } from "./catalogFixtures";

function DossierHarness({ initiallyRead = false }: { initiallyRead?: boolean }) {
  const [reading, setReading] = useState<TaleReadingState>(initiallyRead
    ? { status: "read", percent: 100, favorite: false }
    : { status: "in-progress", percent: 38, favorite: false });
  return (
    <div className="storybook-stage storybook-stage--dossier">
      <ReadingDossier
        dossier={dossierFor(firstTale, firstRegister, reading.status === "read")}
        readingStatus={reading.status}
        readingPercent={reading.percent}
        isFavorite={reading.favorite}
        onOpenTale={fn()}
        onSetStatus={(status) => setReading((current) => ({
          ...current,
          status,
          percent: status === "read" ? 100 : status === "unread" ? 0 : current.percent > 0 && current.percent < 100 ? current.percent : 25,
        }))}
        onSetPercent={(percent) => setReading((current) => ({ ...current, percent, status: percent === 0 ? "unread" : percent === 100 ? "read" : "in-progress" }))}
        onToggleFavorite={() => setReading((current) => ({ ...current, favorite: !current.favorite }))}
        onOpenNotes={fn()}
        onOpenFigure={fn()}
        onOpenLexicon={fn()}
        onOpenAdjacent={fn()}
        onOpenMethod={fn()}
        onDismiss={fn()}
      />
    </div>
  );
}

const meta = {
  title: "Register/Reading Dossier",
  component: ReadingDossier,
  tags: ["autodocs"],
  args: {
    dossier: dossierFor(firstTale, firstRegister),
    readingStatus: "unread",
    readingPercent: 0,
    isFavorite: false,
    onOpenTale: fn(),
    onSetStatus: fn(),
    onSetPercent: fn(),
    onToggleFavorite: fn(),
    onOpenNotes: fn(),
    onOpenFigure: fn(),
    onOpenLexicon: fn(),
    onOpenAdjacent: fn(),
    onOpenMethod: fn(),
    onDismiss: fn(),
  },
} satisfies Meta<typeof ReadingDossier>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DossierHarness />,
};

export const RecordedAsRead: Story = {
  render: () => <DossierHarness initiallyRead />,
  args: {
    dossier: dossierFor(firstTale, firstRegister, true),
  },
};
