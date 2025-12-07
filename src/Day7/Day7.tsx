import { useCallback, useEffect, useMemo, useRef } from "react";
import { useVideoConfig } from "remotion";

import { DayWrapperShorts } from "../Shorts/DayWrapperShorts";
import { Canvas } from "../common/Canvas";
import { useCurrentTime } from "../common/useCurrentTime";
import { heightShorts, widthShorts } from "../constants";
import { raw } from "./raw";

// const raw = `
// .......S.......
// ...............
// .......^.......
// ...............
// ......^.^......
// ...............
// .....^.^.^.....
// ...............
// ....^.^...^....
// ...............
// ...^.^...^.^...
// ...............
// ..^...^.....^..
// ...............
// .^.^.^.^.^...^.
// ...............
// `;

const solve = () => {
	const lines = raw.trim().split("\n");
	let beams = [lines[0].indexOf("S")];
	let splits = 0;
	const allBeams = [beams];
	for (let row = 1; row < lines.length; row++) {
		const newBeams = new Set<number>();
		for (const x of beams) {
			if (lines[row][x] == ".") {
				newBeams.add(x);
			} else {
				newBeams.add(x - 1);
				newBeams.add(x + 1);
				splits++;
			}
		}
		beams = [...newBeams];
		allBeams.push(beams);
	}
	console.log("Part 1:", splits);

	let qBeams = new Map<number, number>([[lines[0].indexOf("S"), 1]]);
	const allQBeams = [qBeams];
	for (let row = 1; row < lines.length; row++) {
		const newQBeams = new Map<number, number>();
		const add = (x: number, v: number) => {
			const old = newQBeams.get(x) ?? 0;
			newQBeams.set(x, old + v);
		};
		for (const [x, timelines] of qBeams) {
			if (lines[row][x] == ".") {
				add(x, timelines);
			} else {
				add(x - 1, timelines);
				add(x + 1, timelines);
			}
		}
		qBeams = newQBeams;
		allQBeams.push(qBeams);
	}
	let sum = 0;
	for (const [_, timelines] of qBeams) {
		sum += timelines;
	}
	console.log("Part 2:", sum);

	return { lines, allBeams, allQBeams };
};

const size = 15;
const getXPos = (lines: string[], x: number) =>
	x * size - (lines[0].length * size) / 2 + widthShorts / 2;

export const Day7Short = () => {
	const { lines, allBeams, allQBeams } = useMemo(solve, []);
	const time = useCurrentTime();
	useEffect(() => {
		const audioInner = lines
			.filter((_, i) => i % 2 == 0)
			.slice(0, 64)
			.map(
				(line, y) =>
					"[" +
					[
						"~",
						...line.split("").flatMap((char, x) => {
							if (
								char == "^" &&
								y > 0 &&
								!allBeams[y * 2 - 1].includes(x)
							) {
								return `${Math.floor(x / 2 - 20)}`;
							} else {
								return [];
							}
						}),
					].join(", ") +
					"]",
			)
			.join(" ");
		const gainInner = lines
			.filter((_, i) => i % 2 == 0)
			.slice(0, 64)
			.map((line, y) => {
				const max =
					1 +
					line
						.split("")
						.map((char, x) => {
							if (
								char == "^" &&
								y > 0 &&
								!allBeams[y * 2 - 1].includes(x)
							) {
								return (
									Math.log(
										allQBeams[y * 2 - 1].get(x - 1) ?? 2,
									) / 5
								);
							} else {
								return 0;
							}
						})
						.reduce((a, b) => a + b);
				return max.toFixed(0);
			})
			.join(" ");
		const audio =
			"$: n(`<\n" +
			audioInner +
			"\n" +
			audioInner +
			'\n>`).sound("<sine@64 square@64>").scale("c1:minor").n(`<\n1@64 ' +
			gainInner +
			"\n>`).fast(8).gain(0.9)";
		console.log(audio);
	}, [lines, allBeams, allQBeams]);
	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			const maxY = (time % 8) * 16;
			const isPart1 = time < 8;
			for (let y = 0; y < lines.length; y++) {
				for (let x = 0; x < lines[y].length; x++) {
					const isIsolated = y > 0 && !allBeams[y - 1].includes(x);
					if (
						lines[y][x] == "^" &&
						(y > maxY - 1 / 2 || isIsolated)
					) {
						ctx.fillStyle = y <= maxY - 1 / 2 ? "#0F0" : "#080";
						ctx.beginPath();
						ctx.arc(
							getXPos(lines, x) + size / 2,
							y * size + 2,
							4,
							0,
							2 * Math.PI,
							false,
						);
						ctx.fill();
					}
				}
			}
			for (let y = 0; y < lines.length; y++) {
				ctx.strokeStyle = "#CCC";
				ctx.lineCap = "round";
				if (y <= maxY && y % 2 == 1) {
					for (const beam of allBeams[y]) {
						const count = allQBeams[y].get(beam) ?? 0;
						ctx.lineWidth =
							isPart1 ? 3 : Math.log(Math.max(count, 2)) / 2;
						const color = Math.min(
							Math.max(
								0,
								Math.floor(255 - (25 - ctx.lineWidth * 2) * 5),
							),
							255,
						);
						const color1Str = color.toString(16).padStart(2, "0");
						ctx.strokeStyle =
							isPart1 ? "#CCC" : (
								`#${color1Str}${color1Str}${color1Str}`
							);
						ctx.beginPath();
						const overflow =
							Math.floor(y) == Math.floor(maxY) ? maxY % 1 : 1;
						ctx.moveTo(getXPos(lines, beam) + size / 2, y * size);
						ctx.lineTo(
							getXPos(lines, beam) + size / 2,
							(y + overflow) * size,
						);
						ctx.moveTo(
							getXPos(lines, beam) + size / 2,
							(y + 1) * size,
						);
						if (y + 1 <= maxY) {
							const overflow =
								Math.floor(y + 1) == Math.floor(maxY) ?
									maxY % 1
								:	1;
							if (lines[y + 1]?.[beam] == "^") {
								ctx.lineTo(
									getXPos(lines, beam) -
										size * overflow +
										size / 2,
									(y + 1 + overflow) * size,
								);
								ctx.moveTo(
									getXPos(lines, beam) + size / 2,
									(y + 1) * size,
								);
								ctx.lineTo(
									getXPos(lines, beam) +
										size * overflow +
										size / 2,
									(y + 1 + overflow) * size,
								);
							} else {
								ctx.lineTo(
									getXPos(lines, beam) + size / 2,
									(y + 1 + overflow) * size,
								);
							}
						}
						ctx.stroke();
					}
				}
			}
		},
		[lines, allBeams, time],
	);
	return (
		<DayWrapperShorts day={7} title="Laboratories" dayDuration={16}>
			<Canvas draw={draw} />
		</DayWrapperShorts>
	);
};
Day7Short.duration = 16;

/**
setcps(1)

$: s("lt").gain("<0 0.5>").slow(8)

_$: s("bd").gain(0.5)

$: n(`<
[~] [~] [~] [~] [~] [~] [~] [~] [~] [~] [~] [~, 12] [~] [~] [~, 10, 16] [~] [~, 15] [~, 17] [~] [~, 13] [~] [~] [~] [~, 15] [~, 6, 8, 17, 18] [~] [~, 16, 17] [~, 23] [~, 17] [~] [~] [~, 14] [~, 23, 24] [~, 19, 27, 28] [~, 6, 14] [~, 22] [~, 6] [~, 19] [~, 8, 9] [~] [~, 2, 9, 26] [~, 11, 12, 31] [~, -1] [~, -3, 12, 22] [~, -2, 2] [~, 1, 20] [~, 11, 15, 32] [~, 24] [~, 3, 5, 26] [~, 33] [~, 4, 26] [~] [~, 19, 20, 24] [~, 11] [~, 35] [~, 26, 27] [~, 8, 28] [~, 16, 17] [~, 32] [~, -10] [~] [~, -10, -7, 8, 9, 10, 36] [~] [~, -14]
[~] [~] [~] [~] [~] [~] [~] [~] [~] [~] [~] [~, 12] [~] [~] [~, 10, 16] [~] [~, 15] [~, 17] [~] [~, 13] [~] [~] [~] [~, 15] [~, 6, 8, 17, 18] [~] [~, 16, 17] [~, 23] [~, 17] [~] [~] [~, 14] [~, 23, 24] [~, 19, 27, 28] [~, 6, 14] [~, 22] [~, 6] [~, 19] [~, 8, 9] [~] [~, 2, 9, 26] [~, 11, 12, 31] [~, -1] [~, -3, 12, 22] [~, -2, 2] [~, 1, 20] [~, 11, 15, 32] [~, 24] [~, 3, 5, 26] [~, 33] [~, 4, 26] [~] [~, 19, 20, 24] [~, 11] [~, 35] [~, 26, 27] [~, 8, 28] [~, 16, 17] [~, 32] [~, -10] [~] [~, -10, -7, 8, 9, 10, 36] [~] [~, -14]
>`).sound("<sine@64 square@64>").scale("c1:minor").n(`<
1@64 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 2 2 1 2 1 1 1 3 5 1 5 2 3 1 1 4 4 5 5 3 2 4 7 1 7 8 2 8 4 5 9 4 10 2 7 1 12 5 2 7 8 10 3 2 1 19 1 1
>`).fast(8).gain(0.9)
 */
