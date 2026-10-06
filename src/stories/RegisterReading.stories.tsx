import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useEffect, useState } from "react";
import { RadialStage } from "../components/RadialStage";
import { registerById, registers, taleById } from "../data";
import type { RegisterId, TaleId } from "../types";
import {
  figuresForTale,
  firstRegister,
  firstTale,
  motifsForTale,
} from "./catalogFixtures";

function RadialHarness({ completed = false }: { completed?: boolean }) {
  const [registerId, setRegisterId] = useState<RegisterId>(firstRegister.id);
  const [taleId, setTaleId] = useState<TaleId>(firstTale.id);
  const register = registerById.get(registerId)!;
  const tale = taleById.get(taleId) ?? taleById.get(register.taleIds[0])!;

  function selectRegister(nextId: RegisterId) {
    const nextRegister = registerById.get(nextId)!;
    setRegisterId(nextId);
    setTaleId(nextRegister.taleIds[0]);
  }

  function step(direction: -1 | 1) {
    const currentIndex = registers.findIndex((entry) => entry.id === register.id);
    const nextIndex = (currentIndex + direction + registers.length) % registers.length;
    selectRegister(registers[nextIndex]!.id);
  }

  return (
    <div className="storybook-stage storybook-stage--register">
      <RadialStage
        registers={registers}
        activeRegister={register}
        activeTale={tale}
        activeFigures={figuresForTale(tale)}
        activeMotifs={motifsForTale(tale)}
        readRegisterIds={completed ? registers.map((entry) => entry.id) : []}
        onSelectRegister={selectRegister}
        onSelectTale={setTaleId}
        onSelectFigure={fn()}
        onStep={step}
      />
    </div>
  );
}

function ReducedMotionHarness() {
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => {
      if (query !== "(prefers-reduced-motion: reduce)") {
        return originalMatchMedia.call(window, query);
      }
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => true,
      };
    };
    setMediaReady(true);
    return () => {
      window.matchMedia = originalMatchMedia;
    };
  }, []);

  return mediaReady ? (
    <div className="storybook-reduced-motion">
      <RadialHarness />
    </div>
  ) : null;
}

const radialMeta = {
  title: "Register/Radial Stage",
  component: RadialStage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "The fifteen-part editorial index. Arrow keys, wheel gestures, drag gestures, and segment controls all traverse the same selected register.",
      },
    },
  },
  args: {
    registers,
    activeRegister: firstRegister,
    activeTale: firstTale,
    activeFigures: figuresForTale(firstTale),
    activeMotifs: motifsForTale(firstTale),
    readRegisterIds: [],
    onSelectRegister: fn(),
    onSelectTale: fn(),
    onSelectFigure: fn(),
    onStep: fn(),
  },
} satisfies Meta<typeof RadialStage>;

export default radialMeta;
type RadialStory = StoryObj<typeof radialMeta>;

export const Default: RadialStory = {
  render: () => <RadialHarness />,
};

export const CompletedRoute: RadialStory = {
  render: () => <RadialHarness completed />,
  parameters: {
    docs: {
      description: {
        story: "Every editorial register bears its small celadon completion mark while remaining fully traversable.",
      },
    },
  },
};

export const NarrowMobile: RadialStory = {
  render: () => <RadialHarness />,
  globals: {
    viewport: { value: "liaozhaiMobile", isRotated: false },
  },
  parameters: {
    viewport: { defaultViewport: "liaozhaiMobile" },
    docs: {
      description: {
        story: "The same register at the project’s 390 × 844 mobile proof point.",
      },
    },
  },
};

export const ReducedMotion: RadialStory = {
  render: () => <ReducedMotionHarness />,
  parameters: {
    docs: {
      description: {
        story: "Forces the operating system reduced-motion preference: the register reaches the selected state without GSAP rotation or path-drawing choreography.",
      },
    },
  },
};
