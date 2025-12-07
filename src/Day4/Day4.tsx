import { memo, useEffect, useMemo } from "react";
import { Easing, interpolate } from "remotion";

import { DayWrapperShorts } from "../Shorts/DayWrapperShorts";
import { Rectangle } from "../common/Rectangle";
import { Scale } from "../common/Scale";
import { Translate } from "../common/Translate";
import { range } from "../common/range";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp, heightShorts, widthShorts } from "../constants";
import { raw } from "./raw";

// const raw = `
// ..@@.@@@@.
// @@@.@.@.@@
// @@@@@.@.@@
// @.@@@@..@.
// @@.@@@@.@@
// .@@@@@@@.@
// .@.@.@.@@@
// @.@@@.@@@@
// .@@@@@@@@.
// @.@.@@@.@.
// `;

const doIt = (grid: string[][]) => {
	let count = 0;
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j] != "@") {
				continue;
			}
			let localCount = 0;
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx == 0 && dy == 0) {
						continue;
					}
					const y = i + dy;
					const x = j + dx;
					if (
						y < 0 ||
						y >= grid.length ||
						x < 0 ||
						x >= grid[0].length
					) {
						continue;
					}
					if (grid[y][x] == "@" || grid[y][x] == "x") {
						localCount++;
					}
				}
			}
			if (localCount < 4) {
				count++;
				grid[i][j] = "x";
			}
		}
	}
	const intGrid = clone(grid);
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j] == "x") {
				grid[i][j] = ".";
			}
		}
	}
	return { count, intGrid };
};

const doPart1 = (grid: string[][]) => {
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j] != "@") {
				continue;
			}
			let localCount = 0;
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx == 0 && dy == 0) {
						continue;
					}
					const y = i + dy;
					const x = j + dx;
					if (
						y < 0 ||
						y >= grid.length ||
						x < 0 ||
						x >= grid[0].length
					) {
						continue;
					}
					if (grid[y][x] != ".") {
						localCount++;
					}
				}
			}
			grid[i][j] = `${localCount}`;
		}
	}
	return grid;
};

const clone = (grid: string[][]) => {
	return grid.map((line) => line.slice());
};

const solve = () => {
	const grid = raw
		.trim()
		.split("\n")
		.map((l) => l.split(""));
	const grid1 = doPart1(clone(grid));
	const grids = [];
	let count = 0;
	while (true) {
		const { count: localCount, intGrid } = doIt(grid);
		grids.push(intGrid);
		if (localCount == 0) {
			break;
		}
		count += localCount;
	}
	console.log("Part 1: ", count);
	return { grid1, grids };
};

const width = 18;
const height = 18;

const Char = memo(({ char, time }: { char: string; time?: number }) => {
	const n = Number(char);
	const color =
		time === undefined ?
			char == "@" ? "#FFF"
			: char == "x" ? "#0F0"
			: "transparent"
		: char === "." ? "transparent"
		: n <= time ?
			n < 4 ?
				"#0F0"
			:	"#FFF"
		:	"#888";

	return (
		<Rectangle
			style={{
				color: "white",
				backgroundColor: color,
				// outline: char == "@" ? "0.1px solid #CCC" : undefined,
				border: char == "@" ? `1px solid ${color}` : undefined,
			}}
			w={width}
			h={height}
		></Rectangle>
	);
});

const Line = memo(({ line, time }: { line: string[]; time?: number }) => {
	return line.map((c, j) => (
		<Translate
			key={j}
			dx={j * width + (widthShorts - line.length * width) / 2}
		>
			<Char char={c} time={time} />
		</Translate>
	));
});

const Grid = memo(({ grid, time }: { grid: string[][]; time?: number }) => {
	return grid.map((line, i) => (
		<Translate
			key={i}
			dy={i * height + (heightShorts - grid.length * height) / 2}
		>
			<Line
				line={line}
				time={
					time === undefined ? undefined : time + 1 - i / grid.length
				}
			/>
		</Translate>
	));
});

const maxRadius = 40;

const calculateAudio = (grids: string[][][]) => {
	const grid = grids[0];
	const points = grid.flatMap((line, i) =>
		line.flatMap((c, j) => {
			if (c != "x") {
				return [];
			}
			const d = Math.sqrt(
				Math.pow(i - grid.length / 2, 2) +
					Math.pow(j - line.length / 2, 2),
			);
			if (d > maxRadius) {
				return [];
			}
			return { i, j, d: interpolate(d, [1, maxRadius], [0, 8], clamp) };
		}),
	);
	points.sort((a, b) => a.d - b.d);
	const f = (i: number, j: number) => i + j / 8;
	return (
		`
setcps(1)

$: s("lt").gain("<1.5 1>").slow(8)

$: s("bd").gain(0.5)

$: n(\`<\n` +
		range(0, 8)
			.map(
				(i) =>
					"[" +
					range(0, 8)
						.map(
							(j) =>
								points.filter(
									({ d }) => d >= f(i, j) && d < f(i, j + 1),
								).length,
						)
						.join(" ") +
					"]",
			)
			.join("\n") +
		"\n" +
		range(0, 8)
			.map(
				(i) =>
					"[" +
					range(0, 8)
						.map((j) => size(grids[i * 8 + j]))
						.join(" ") +
					"]",
			)
			.join("\n") +
		'\n>`).scale("C4:major").s("sine");'
	);
};

const size = (grid: string[][]) => {
	let count = 0;
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j] == "x") {
				count++;
			}
		}
	}
	return Math.floor(count / 30);
};

const countChar = (grid: string[][], char: string) => {
	let count = 0;
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j] == char) {
				count++;
			}
		}
	}
	return count;
};

window.copyAudio = () => {
	navigator.clipboard.writeText(calculateAudio(solve().grids));
};

export const Day4Short = () => {
	const { grid1, grids } = useMemo(solve, []);
	useEffect(() => {
		const notes = [
			...range(0, 64).map((k) =>
				Math.ceil(
					2 *
						Math.log(
							countChar(grid1, String(Math.floor(k / 8) + 1)),
						),
				),
			),
			...range(0, 64).map((k) =>
				Math.ceil(2 * Math.log(countChar(grids[k], "x"))),
			),
		];
		const notes2 = notes.reduce<{ note: number; duration: number }[]>(
			(acc, curr) =>
				acc.length > 0 && curr == acc.at(-1)?.note ?
					[
						...acc.slice(0, -1),
						{ ...acc.at(-1)!, duration: acc.at(-1)!.duration + 1 },
					]
				:	[...acc, { note: curr, duration: 1 }],
			[],
		);
		console.log(
			`$: n("${notes2.map(({ note, duration }) => `${note}@${duration}`).join(" ")}").slow(16).scale("C2:major").s("triangle").n(3).attack(0.01)`,
		);
	}, [grid1, grids]);
	// 	console.log(
	// 		`$: n("${range(0, 64)
	// 			.map((k) =>
	// 				Math.ceil(
	// 					2 *
	// 						Math.log(
	// 							countChar(grid1, String(Math.floor(k / 8) + 1)),
	// 						),
	// 				),
	// 			)
	// 			.join(
	// 				" ",
	// 			)}").slow(8).scale("C2:major").s("triangle").n(3).attack(0.01).decay(0.2)`,
	// 	);
	// }, [grid1]);
	// useEffect(() => {
	// 	console.log(
	// 		`$: n("${range(0, 64)
	// 			.map((k) => Math.ceil(2 * Math.log(countChar(grids[k], "x"))))
	// 			.join(
	// 				" ",
	// 			)}").slow(8).scale("C2:major").s("triangle").n(3).attack(0.01).decay(0.2)`,
	// 	);
	// }, [grids]);
	const time = useCurrentTime();
	const i = Math.floor(
		interpolate(time, [8, 15.5], [0, grids.length - 1], {
			...clamp,
		}),
	);
	console.log();
	const s = interpolate(time, [8, 15.5], [1, 1 / 3], {
		...clamp,
		easing: Easing.out(Easing.poly(5)),
	});
	const t =
		Math.floor(time) + interpolate(time % 1, [0, 1], [0.1, 0.9], clamp);
	return (
		<DayWrapperShorts day={4} title="Printing Department" dayDuration={16}>
			<Scale sx={s} sy={s}>
				{time < 8 && <Grid grid={grid1} time={t} />}
				{time > 8 && <Grid grid={grids[i]} />}
			</Scale>
		</DayWrapperShorts>
	);
};
Day4Short.duration = 16;

/**
setcps(1)

$: s("lt").gain("<1.5 1>").slow(8)

$: s("bd").gain(0.5)

$: n("9@8 12@8 14@8 16@8 17@16 15@8 12@8 15@1 14@3 13@4 12@3 11@4 10@6 9@4 8@2 7@1 8@1 7@2 6@3 5@8 4@4 3@1 4@1 3@1 4@1 3@2 2@1 3@2 0@2 2@1 3@2 2@2 3@1 2@1").slow(16).scale("C2:major").s("triangle").n(3).attack(0.01)
 */
