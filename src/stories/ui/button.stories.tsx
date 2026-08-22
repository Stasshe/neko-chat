import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/button";

const meta: Meta<typeof Button> = {
  component: Button,
  args: {
    children: "投稿する",
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Logout: Story = {
  args: { variant: "logout", children: "ログアウト" },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true },
};
