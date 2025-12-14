// components/characters/svgMap.ts

// Import all 24 SVGs
// OPEN
import PurpleOpen from "./expressions/open/purple.svg";
import GreenOpen from "./expressions/open/green.svg";
import YellowOpen from "./expressions/open/yellow.svg";
import BlueOpen from "./expressions/open/blue.svg";
import OrangeOpen from "./expressions/open/orange.svg";
import RedOpen from "./expressions/open/red.svg";

// CLOSED
import PurpleClosed from "./expressions/closed/purple.svg";
import GreenClosed from "./expressions/closed/green.svg";
import YellowClosed from "./expressions/closed/yellow.svg";
import BlueClosed from "./expressions/closed/blue.svg";
import OrangeClosed from "./expressions/closed/orange.svg";
import RedClosed from "./expressions/closed/red.svg";

// WINK
import PurpleWink from "./expressions/wink/purple.svg";
import GreenWink from "./expressions/wink/green.svg";
import YellowWink from "./expressions/wink/yellow.svg";
import BlueWink from "./expressions/wink/blue.svg";
import OrangeWink from "./expressions/wink/orange.svg";
import RedWink from "./expressions/wink/red.svg";

// CHEEKY
import PurpleCheeky from "./expressions/cheeky/purple.svg";
import GreenCheeky from "./expressions/cheeky/green.svg";
import YellowCheeky from "./expressions/cheeky/yellow.svg";
import BlueCheeky from "./expressions/cheeky/blue.svg";
import OrangeCheeky from "./expressions/cheeky/orange.svg";
import RedCheeky from "./expressions/cheeky/red.svg";

export const emojiMap = {
  open: {
    purple: PurpleOpen,
    green: GreenOpen,
    yellow: YellowOpen,
    blue: BlueOpen,
    orange: OrangeOpen,
    red: RedOpen,
  },
  closed: {
    purple: PurpleClosed,
    green: GreenClosed,
    yellow: YellowClosed,
    blue: BlueClosed,
    orange: OrangeClosed,
    red: RedClosed,
  },
  wink: {
    purple: PurpleWink,
    green: GreenWink,
    yellow: YellowWink,
    blue: BlueWink,
    orange: OrangeWink,
    red: RedWink,
  },
  cheeky: {
    purple: PurpleCheeky,
    green: GreenCheeky,
    yellow: YellowCheeky,
    blue: BlueCheeky,
    orange: OrangeCheeky,
    red: RedCheeky,
  },
} as const;
