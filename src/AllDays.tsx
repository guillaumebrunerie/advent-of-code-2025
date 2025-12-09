import type { ReactNode } from "react";

import { Day1 } from "./Day1/Day1";
import { Day2 } from "./Day2/Day2";
import { Day3 } from "./Day3/Day3";
import { Day4 } from "./Day4/Day4";
import { Day5 } from "./Day5/Day5";
import { Day6 } from "./Day6/Day6";
import { Day7 } from "./Day7/Day7";
import { Day8 } from "./Day8/Day8";
import { Day9 } from "./Day9/Day9";
import type { DayProps } from "./Shorts/DayWrapper";

type Day = {
	Component: ({ videoType }: DayProps) => ReactNode;
	day: number;
};

export const allDays: Day[] = [
	{ Component: Day1, day: 1 },
	{ Component: Day2, day: 2 },
	{ Component: Day3, day: 3 },
	{ Component: Day4, day: 4 },
	{ Component: Day5, day: 5 },
	{ Component: Day6, day: 6 },
	{ Component: Day7, day: 7 },
	{ Component: Day8, day: 8 },
	{ Component: Day9, day: 9 },
];
