import type { Config } from "partykit/config";

const config: Config = {
  name: "connect4",
  parties: {
    room: "src/party/room.ts",
  },
  persist: true,
};

export default config;
