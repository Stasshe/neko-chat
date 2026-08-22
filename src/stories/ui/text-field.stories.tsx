import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { TextField } from "@/components/text-field";

const meta: Meta<typeof TextField> = {
  component: TextField,
  args: {
    id: "story-field",
    label: "ひとこと",
    placeholder: "30文字以内で",
    maxLength: 30,
  },
};
export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <TextField {...args} value={value} onChange={setValue} />;
  },
};

export const HiddenLabel: Story = {
  args: { hideLabel: true },
  render: (args) => {
    const [value, setValue] = useState("にゃー");
    return <TextField {...args} value={value} onChange={setValue} />;
  },
};
