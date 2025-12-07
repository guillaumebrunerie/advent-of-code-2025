import { ReactNode } from "react";

import {
	// Day1Full, Day1Partial,
	Day1Short,
} from "./Day1/Day1";
import { Day2Short } from "./Day2/Day2";
import { Day3Short } from "./Day3/Day3";
import { Day4Short } from "./Day4/Day4";
import { Day5Short } from "./Day5/Day5";
import { Day6Short } from "./Day6/Day6";
import { Day7Short } from "./Day7/Day7";

type Video = {
	(): ReactNode;
	duration: number;
};

type Day = {
	Short?: Video;
	Full?: Video;
	Partial?: Video;
	day: number;
};

export const allDays: Day[] = [
	{
		Short: Day1Short, // , Full: Day1Full, Partial: Day1Partial
		day: 1,
	},
	{
		Short: Day2Short, // , Full: Day1Full, Partial: Day1Partial
		day: 2,
	},
	{
		Short: Day3Short, // , Full: Day1Full, Partial: Day1Partial
		day: 3,
	},
	{
		Short: Day4Short, // , Full: Day1Full, Partial: Day1Partial
		day: 4,
	},
	{
		Short: Day5Short, // , Full: Day1Full, Partial: Day1Partial
		day: 5,
	},
	{
		Short: Day6Short, // , Full: Day1Full, Partial: Day1Partial
		day: 6,
	},
	{
		Short: Day7Short, // , Full: Day1Full, Partial: Day1Partial
		day: 7,
	},
];
