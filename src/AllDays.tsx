import { ReactNode } from "react";

import { Day1Full, Day1Partial, Day1Short } from "./Day1/Day1";

type Video = {
	(): ReactNode;
	duration: number;
};

type Day = {
	Short: Video;
	Full: Video;
	Partial: Video;
	day: number;
};

export const allDays: Day[] = [
	{ Short: Day1Short, Full: Day1Full, Partial: Day1Partial, day: 1 },
];
