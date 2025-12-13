import { useCallback, useEffect, useMemo } from "react";
import { interpolate, useVideoConfig } from "remotion";

import { DayProps, DayWrapper } from "../Shorts/DayWrapper";
import { Canvas } from "../common/Canvas";
import { range } from "../common/range";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp } from "../constants";
import { raw } from "./raw";

const solve = () => {
	const data = raw.split("\n\n").at(-1)!;
	const sizes = data
		.trim()
		.split("\n")
		.map((line) => {
			const [a, b] = line.split(": ");
			const [width, height] = a.split("x").map(Number);
			const shapeCounts = b.split(" ").map(Number);
			return { width, height, shapeCounts };
		});
	const shapeSizes = [7, 7, 7, 5, 6, 7];

	let count = 0;
	for (const { width, height, shapeCounts } of sizes) {
		let areaUsed = 0;
		let shapes = 0;
		shapeCounts.forEach((count, i) => {
			areaUsed += count * shapeSizes[i];
			shapes += count;
		});
		const totalArea = width * height;
		if (totalArea < areaUsed) {
			continue;
		}

		const a = Math.floor(width / 3);
		const b = Math.floor(height / 3);
		const slots = a * b;
		if (shapes <= slots) {
			count++;
			continue;
		}
		console.log("Unknown", width, height, shapeCounts);
	}
	console.log("Part 1:", count);
};

export const Day12 = ({ videoType }: DayProps) => {
	const data = useMemo(solve, []);
	const time = useCurrentTime();
	const { width, height } = useVideoConfig();

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {},
		[time, width, height],
	);

	return (
		<DayWrapper videoType={videoType} day={12} title="Christmas Tree Farm">
			<Canvas draw={draw} />
		</DayWrapper>
	);
};
