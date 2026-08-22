import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MobileShell } from "@/components/mobile-shell";

const meta: Meta<typeof MobileShell> = {
  component: MobileShell,
};
export default meta;

type Story = StoryObj<typeof MobileShell>;

export const Default: Story = {
  args: { children: <p style={{ padding: 16 }}>content</p> },
};
