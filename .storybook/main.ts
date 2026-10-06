import type { StorybookConfig } from "@storybook/react-vite";

const config = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  staticDirs: ["../public"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  core: {
    disableTelemetry: true,
  },
} satisfies StorybookConfig;

export default config;
