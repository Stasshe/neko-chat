import type { Preview } from "@storybook/nextjs-vite";
import React from "react";

import { AuthContext } from "../src/lib/auth/context";

const mockAuth = {
  isLoading: false,
  isAuthenticated: true,
  userId: "storybook-user",
  session: null,
  signOut: async () => {},
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider value={mockAuth}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export default preview;
