import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MemberAvatars } from "./member-avatars";
import type { PostUser } from "@/types/app";

const members: PostUser[] = [
  { id: "00000000-0000-4000-8000-000000000001", username: "たま", catType: "white" },
  { id: "00000000-0000-4000-8000-000000000002", username: "みけ", catType: "mike" },
  { id: "00000000-0000-4000-8000-000000000003", username: "くろ", catType: "black" },
];

const meta: Meta<typeof MemberAvatars> = {
  component: MemberAvatars,
  args: { members },
};
export default meta;

type Story = StoryObj<typeof MemberAvatars>;

export const Default: Story = {};

export const Overflow: Story = {
  args: {
    members: [
      ...members,
      { id: "00000000-0000-4000-8000-000000000004", username: "しゃむ", catType: "sham" },
      { id: "00000000-0000-4000-8000-000000000005", username: "ちゃとら", catType: "chatora" },
      { id: "00000000-0000-4000-8000-000000000006", username: "あまり", catType: "white" },
    ],
  },
};
