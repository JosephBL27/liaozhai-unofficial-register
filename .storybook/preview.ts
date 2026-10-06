import "@fontsource-variable/literata/wght.css";
import "@fontsource-variable/noto-serif-sc/wght.css";
import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@xyflow/react/dist/style.css";
import "../src/styles/tokens.css";
import "../src/styles/app.css";
import "../src/styles/reviewer-secondary.css";
import "../src/styles/reference-register.css";
import "../src/stories/storybook.css";
import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";

const preview: Preview = {
  decorators: [
    (Story) => createElement(
      "div",
      { className: "app-shell storybook-surface" },
      createElement(Story),
    ),
  ],
  parameters: {
    layout: "fullscreen",
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
    viewport: {
      options: {
        liaozhaiMobile: {
          name: "Liaozhai mobile (390 × 844)",
          styles: { width: "390px", height: "844px" },
          type: "mobile",
        },
        liaozhaiTablet: {
          name: "Liaozhai tablet (768 × 1024)",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        liaozhaiDesktop: {
          name: "Liaozhai desktop (1440 × 900)",
          styles: { width: "1440px", height: "900px" },
          type: "desktop",
        },
      },
    },
  },
};

export default preview;
