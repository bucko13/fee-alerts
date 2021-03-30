import { AlertType } from "@/lib/utils"

export const getFeeFixtures = (
  low: number,
  high: number
): [
  name: string,
  args: [curr: number, prev: number],
  expected: AlertType
][] => [
  ["Previous is gtlow, current is equal to LOW", [low, low + 5], "ltlow"],
  ["Previous is gtlow, current is less than LOW", [low - 5, low + 10], "ltlow"],
  ["Both are ltlow", [low - 5, low - 1], null],
  ["Both are gtlow, lthigh", [low + 1, low + 2], null],
  [
    "previous was equal to LOW, current is greater than",
    [low + 5, low],
    "gtlow",
  ],
  [
    "Previous was lower than LOW, current is gtlow",
    [low + 2, low - 2],
    "gtlow",
  ],
  ["Previous was lthigh, current is equal to HIGH", [high, high - 5], "gthigh"],
  [
    "Previous was ltlow, current is higher than high",
    [high + 5, low - 5],
    "gthigh",
  ],
  ["Previous and current are gthigh", [high + 5, high + 10], null],
  ["Previously gthigh, now lthigh", [high - 5, high + 5], "lthigh"],
  ["Previously gthigh, now equal to high", [high, high + 10], null],
  ["Previously ltlow, currently gthigh", [high + 10, low - 1], "gthigh"],
  ["Previously equal, now gt high", [high + 10, high], null],
  ["Previously lthigh, currently hthigh", [high + 10, high - 1], "gthigh"],
]
