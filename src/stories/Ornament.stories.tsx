import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Materials/Bamboo Register Ornament",
  parameters: {
    docs: {
      description: {
        component: "An original vector ornament: bamboo, ruled manuscript leaves, and an unlettered cinnabar correction mark. It does not reproduce or slice any historical plate.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StandaloneAsset: Story = {
  render: () => (
    <div className="storybook-stage storybook-stage--ornament">
      <figure>
        <img
          src="/assets/ornaments/liaozhai-bamboo-register.svg"
          alt="Bamboo sprays cross a ruled record leaf around an unlettered cinnabar correction mark."
        />
        <figcaption>
          Contemporary interpretive ornament. Bamboo and manuscript correction are used as Liaozhai-specific context; the geometry is newly authored and contains no decorative pseudo-script.
        </figcaption>
      </figure>
    </div>
  ),
};
