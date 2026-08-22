import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState, ErrorState, LoadingState } from "@/components/status";

const meta: Meta = {
  title: "Components/Status",
};
export default meta;

type Story = StoryObj;

export const Loading: Story = {
  render: () => <LoadingState />,
};

export const ErrorWithRetry: Story = {
  render: () => <ErrorState message="読み込みに失敗した" retry={() => {}} />,
};

export const Empty: Story = {
  render: () => <EmptyState message="投稿がまだない" />,
};
