import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import * as Icons from "@/components/icons";

const meta: Meta = {
  title: "Components/Icons",
};
export default meta;

type Story = StoryObj;

export const Gallery: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: 24 }}>
      {Object.entries(Icons).map(([name, Icon]) => (
        <div
          key={name}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
        >
          <Icon width={24} height={24} />
          <span style={{ fontSize: 12 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
