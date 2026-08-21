import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomTabBar, TopBar } from "./navigation";
import type { PostUser } from "@/types/app";

const members: PostUser[] = [
  { id: "00000000-0000-4000-8000-000000000001", username: "たま", catType: "white" },
  { id: "00000000-0000-4000-8000-000000000002", username: "みけ", catType: "mike" },
];

const meta: Meta = {
  title: "Components/Navigation",
};
export default meta;

type Story = StoryObj;

export const Top: Story = {
  render: () => <TopBar groupName="うちの猫部屋" members={members} />,
};

export const BottomTabs: Story = {
  render: () => <BottomTabBar />,
};
