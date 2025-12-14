import { memo, useMemo } from "react";
import { interpolate, useVideoConfig } from "remotion";

import { DayProps, DayWrapper, useVideoType } from "../Shorts/DayWrapper";
import { Rectangle } from "../common/Rectangle";
import { Translate } from "../common/Translate";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp } from "../constants";
import { raw } from "./raw";

// const raw = `
// 987654321111111
// 811111111111119
// 234234234234278
// 818181911112111
// `;

const getWithDigits = (line: string, totalDigits: number) => {
	let previousDigitIndex = -1;
	let currentNumber = 0;
	const indices = [];
	const digits = [];
	for (let digitIndex = 0; digitIndex < totalDigits; digitIndex++) {
		const partialLine = line
			.slice(
				previousDigitIndex + 1,
				line.length - totalDigits + 1 + digitIndex,
			)
			.split("")
			.map(Number);
		const digit = Math.max(...partialLine);
		const index = partialLine.indexOf(digit);
		currentNumber = currentNumber * 10 + digit;
		previousDigitIndex = index + previousDigitIndex + 1;
		indices.push(previousDigitIndex);
		digits.push(digit);
	}
	return { number: currentNumber, indices, digits };
};

const solve = () => {
	let part1 = 0;
	let part2 = 0;
	const lines = raw.trim().split("\n");
	const data = [];
	for (const line of lines) {
		const { number: n1, indices: i1, digits: d1 } = getWithDigits(line, 2);
		part1 += n1;
		const { number: n2, indices: i2, digits: d2 } = getWithDigits(line, 12);
		part2 += n2;
		data.push({ line, i1, i2, d1, d2 });
	}
	console.log("Part 1:", part1);
	console.log("Part 2:", part2);
	return data;
};

const Line = memo(
	({
		y,
		line,
		indices,
		highlight,
		size,
	}: {
		y: number;
		line: string;
		indices: number[];
		highlight: boolean;
		size: number;
	}) => {
		const widthX = (size * 2) / 3;
		const videoType = useVideoType();
		return line.split("").map((c, j) => {
			const green = indices.includes(j);
			const doHighlight = highlight && green;
			return (
				<Rectangle
					key={j}
					cx
					x={j * widthX}
					y={
						y -
						(doHighlight ? size * 6
						: green ? size * 1.2
						: 0)
					}
					style={{
						fontSize:
							doHighlight ? size * 10
							: green ? size * 3
							: size,
						color:
							doHighlight ? "#0F0"
							: green ? "#0C0"
							: "#FFF",
						zIndex: green ? 10 : 1,
						fontWeight: green ? "bold" : "normal",
						textShadow:
							doHighlight ? `0 0 ${size / 4}px black` : undefined,
					}}
				>
					{c}
				</Rectangle>
			);
		});
	},
);

const emptyArray: number[] = [];

const All = memo(
	({
		data,
		lineNo,
		part1Lines,
		size,
	}: {
		data: ReturnType<typeof solve>;
		lineNo: number;
		part1Lines: number;
		size: number;
	}) => {
		const verticalSpacing = size * 1.5;
		return data.map(({ line, i1, i2 }, i) => (
			<Line
				key={i}
				y={i * verticalSpacing}
				line={line}
				indices={
					i <= lineNo ?
						i < part1Lines ?
							i1
						:	i2
					:	emptyArray
				}
				highlight={i == lineNo}
				size={size}
			/>
		));
	},
);

export const Day3 = ({ videoType }: DayProps) => {
	const data = useMemo(solve, []);
	const { width, height } = useVideoConfig();
	const time = useCurrentTime();
	const lineNo = Math.floor(time * 8);
	const part1Lines = 8 * 8;
	const size = videoType == "short" ? 10 : 20;
	const widthX = (size * 2) / 3;
	const verticalSpacing = size * 1.5;
	const xOffset = width / 2 - (data[0].line.length * widthX) / 2;
	// console.log(
	// 	data
	// 		.slice(0, part1Lines)
	// 		.map((l) => "[" + l.d1.join(",") + "]")
	// 		.join(" ") +
	// 		"\n" +
	// 		data
	// 			.slice(part1Lines, part1Lines * 2)
	// 			.map((l) => "[" + l.d2.join(",") + "]")
	// 			.join(" ") +
	// 		"\n",
	// );
	return (
		<DayWrapper videoType={videoType} day={3} title="Lobby">
			<Translate
				dx={xOffset}
				dy={
					-lineNo * verticalSpacing + height / 2 - verticalSpacing / 2
				}
				style={{ transform: "scale(1)" }}
			>
				<All
					data={data}
					lineNo={lineNo}
					part1Lines={part1Lines}
					size={size}
				/>
			</Translate>
		</DayWrapper>
	);
};

/**
setcps(1)

$: s("lt").gain("<0 0.5>").slow(8)

$: s("bd").gain(0.4).lpf(3000)

$: n(`<
[7,6] [9,9] [9,4] [9,8] [8,8] [9,9] [9,9] [9,9] [9,8] [9,8] [8,8] [9,8] [9,9] [6,6] [8,8] [9,7] [9,9] [8,8] [9,6] [8,8] [9,6] [9,8] [9,9] [9,9] [8,7] [7,6] [8,8] [5,5] [9,9] [7,7] [8,7] [9,7] [9,5] [7,7] [5,4] [9,9] [8,7] [9,9] [6,5] [7,4] [9,7] [9,9] [8,7] [7,7] [7,7] [9,9] [7,7] [8,6] [8,8] [9,8] [9,8] [7,7] [9,8] [7,7] [6,6] [9,6] [7,7] [6,5] [7,7] [9,9] [5,4] [7,5] [9,6] [9,8]
[8,5,3,3,2,2,2,2,4,3,1,2] [7,7,7,8,2,1,7,3,2,3,1,2] [8,4,3,3,7,3,3,3,5,9,5,3] [8,8,8,7,4,3,7,2,2,2,2,2] [9,9,9,9,9,9,7,6,6,6,8,4] [9,9,9,8,5,6,4,6,5,5,1,7] [8,7,7,4,1,2,1,6,2,2,2,1] [4,3,3,3,3,3,3,3,3,3,3,3] [9,5,4,4,4,3,2,2,1,2,4,4] [5,5,5,5,4,5,4,3,3,2,4,3] [9,7,6,3,3,2,2,4,2,2,4,3] [7,7,6,5,5,5,3,5,3,3,6,2] [4,4,4,4,3,2,3,2,2,2,2,3] [8,7,4,5,3,1,3,4,3,3,2,3] [6,6,4,3,3,5,2,2,3,3,2,2] [8,8,8,8,8,8,7,8,8,3,2,1] [9,9,7,7,6,4,5,4,4,4,4,6] [7,7,4,3,6,2,3,2,2,3,4,2] [8,8,8,6,6,5,5,3,1,6,3,3] [8,8,7,7,7,7,7,6,6,6,4,3] [8,7,5,5,5,5,5,5,5,5,5,5] [7,7,6,6,6,6,6,2,2,2,2,5] [9,8,7,7,7,7,5,5,4,3,2,5] [6,6,4,4,4,3,3,3,4,3,2,1] [6,6,6,6,6,4,4,4,4,6,4,2] [9,9,6,6,6,6,6,6,4,4,6,4] [9,7,6,6,5,5,6,3,3,1,4,2] [4,4,4,4,4,4,4,3,3,2,3,2] [9,9,9,3,2,6,1,4,2,3,2,4] [9,6,4,5,7,7,1,3,7,3,5,3] [9,9,8,8,8,7,4,4,7,4,5,6] [6,6,6,6,6,6,6,6,6,7,8,9] [6,6,6,3,3,3,4,4,3,1,3,4] [5,5,5,5,5,5,5,5,5,5,2,2] [8,8,8,8,8,8,8,8,8,8,8,8] [7,5,5,4,4,4,5,1,1,2,4,5] [9,7,6,7,2,2,2,2,2,2,3,2] [7,7,7,4,4,3,3,3,5,2,2,2] [9,9,9,9,9,9,9,8,9,2,1,2] [8,4,3,2,3,1,2,3,7,3,6,1] [7,6,5,3,5,5,2,2,4,2,1,1] [9,9,6,6,5,4,4,5,5,3,3,4] [9,9,7,7,7,5,7,3,9,7,8,5] [8,8,7,7,7,5,4,4,5,4,4,5] [8,8,8,8,8,7,7,7,7,7,7,7] [9,9,9,8,7,4,9,4,1,4,7,2] [9,8,8,8,8,8,8,7,6,6,4,6] [8,8,7,6,6,6,6,5,3,5,5,5] [8,3,3,4,4,2,3,3,2,1,2,2] [8,6,4,4,3,3,3,3,3,3,3,3] [9,9,9,9,9,8,7,7,3,4,1,3] [9,9,9,8,7,7,8,8,3,4,3,2] [8,8,8,7,6,7,6,5,4,6,4,5] [6,6,6,4,3,3,3,3,3,2,3,3] [7,7,5,5,5,4,4,3,3,2,4,2] [8,7,6,6,6,3,3,2,2,4,4,4] [6,6,4,4,4,3,4,3,6,1,5,5] [8,5,6,2,4,4,2,2,5,6,4,3] [9,9,8,8,5,5,9,1,2,1,6,2] [9,9,8,8,8,8,8,5,9,4,5,4] [7,7,6,6,6,6,6,6,5,4,5,4] [7,7,4,3,4,4,4,3,4,3,4,2] [8,7,7,6,6,5,5,5,5,4,3,1] [8,7,7,7,6,5,4,3,2,4,4,6]
>`).scale("C4:minor").s("sine").fast(8).gain("<1@8 0.25@8>")

 */
