import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CatDisplay } from "@/components/cat-display";
import { catTypes } from "@/types/app";

const meta: Meta<typeof CatDisplay> = {
  component: CatDisplay,
  args: {
    type: "white",
    emotion: "neutral",
  },
  argTypes: {
    type: { control: "select", options: catTypes },
    emotion: { control: "select", options: ["positive", "neutral", "negative", "random"] },
  },
};
export default meta;

type Story = StoryObj<typeof CatDisplay>;

export const Positive: Story = {
  args: { emotion: "positive" },
};

export const Neutral: Story = {};

export const Negative: Story = {
  args: { emotion: "negative" },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      {catTypes.map((type) => (
        <CatDisplay key={type} type={type} />
      ))}
    </div>
  ),
};
