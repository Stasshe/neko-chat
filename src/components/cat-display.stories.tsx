import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CatDisplay } from "./cat-display";
import { catTypes } from "@/types/app";

const meta: Meta<typeof CatDisplay> = {
  component: CatDisplay,
  args: {
    type: "white",
    emotion: "neutral",
    pose: "sit",
  },
  argTypes: {
    type: { control: "select", options: catTypes },
    emotion: { control: "select", options: ["positive", "neutral", "negative", "random"] },
    pose: { control: "select", options: ["sit", "stand", "lie"] },
  },
};
export default meta;

type Story = StoryObj<typeof CatDisplay>;

export const Sit: Story = {};

export const Stand: Story = {
  args: { pose: "stand" },
};

export const Lie: Story = {
  args: { pose: "lie" },
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
