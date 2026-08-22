import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SpeechBubble } from "@/components/speech-bubble";

const meta: Meta<typeof SpeechBubble> = {
  component: SpeechBubble,
  args: {
    children: "今日もいい天気にゃ",
  },
};
export default meta;

type Story = StoryObj<typeof SpeechBubble>;

export const Left: Story = {
  args: { align: "left" },
};

export const Right: Story = {
  args: { align: "right" },
};
