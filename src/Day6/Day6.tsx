import { useEffect, useMemo } from "react";

import { DayWrapperShorts } from "../Shorts/DayWrapperShorts";
import { Rectangle } from "../common/Rectangle";
import { range } from "../common/range";
import { useCurrentTime } from "../common/useCurrentTime";
import { heightShorts, widthShorts } from "../constants";
import { raw } from "./raw";

// const raw = `
// 123 328  51 64
//  45 64  387 23
//   6 98  215 314
// *   +   *   +  `;

const solve = () => {
	const lines = raw
		.trim()
		.split("\n")
		.map((line) =>
			line
				.trim()
				.split(" ")
				.filter((c) => c !== ""),
		);
	let part1 = 0;
	const values1 = [];
	for (let i = 0; i < lines[0].length; i++) {
		const op = lines.at(-1)![i];
		let result = op == "+" ? 0 : 1;
		const values = [];
		for (let j = 0; j < lines.length - 1; j++) {
			const num = Number(lines[j][i]);
			if (op == "+") {
				result += num;
			} else if (op == "*") {
				result *= num;
			}
			values.push(num);
		}
		part1 += result;
		values1.push({ values, op, result });
	}
	console.log("Part 1:", part1);

	const lines2 = raw.trim().split("\n");
	let part2 = 0;
	let currentResult = 0;
	let currentValues = [];
	let currentOp = "";
	const values2 = [];
	const cols = Math.max(...lines2.map((line) => line.length));
	for (let i = 0; i < cols; i++) {
		const op = lines2.at(-1)![i] || " ";
		const col = lines2
			.slice(0, -1)
			.map((line) => line[i] || " ")
			.join("")
			.trim();
		if (col == "") {
			part2 += currentResult;
			values2.push({
				op: currentOp,
				values: currentValues,
				result: currentResult,
			});
			continue;
		}
		if (op != " ") {
			currentOp = op;
			currentResult = op == "+" ? 0 : 1;
			currentValues = [];
		}
		currentResult =
			currentOp == "+" ?
				currentResult + Number(col)
			:	currentResult * Number(col);
		currentValues.unshift(Number(col));
		if (i == cols - 1) {
			part2 += currentResult;
			values2.push({
				op: currentOp,
				values: currentValues,
				result: currentResult,
			});
		}
	}
	console.log("Part 2:", part2);
	return { values1, values2 };
};

const lines = raw.trim().split("\n");
const maxLineWidth = Math.max(...lines.map((l) => l.length));

const getIdx = (i: number) => {
	if (i == 1000) {
		return Math.max(
			...raw
				.trim()
				.split("\n")
				.map((l) => l.length + 1),
		);
	}
	const line = raw.trim().split("\n").at(-1)!;
	const chars = line.split("");
	return chars.findIndex((c, j) => {
		return (
			c != " " && chars.slice(0, j).filter((cc) => cc != " ").length == i
		);
	});
};

const getIdxStart = (i: number, row: number, base = getIdx(i)) => {
	if (lines[row][base] != " ") {
		return base;
	} else {
		return getIdxStart(i, row, base + 1);
	}
};

const getIdxEnd = (i: number, row: number, base = getIdx(i) - 1) => {
	if (lines[row][base] != " ") {
		return base + 2;
	} else {
		return getIdxEnd(i, row, base - 1);
	}
};

const charSize = 60;

const getCenter = (i: number) => {
	const idx1 = getIdx(i);
	const idx2 = getIdx(i + 1);
	return 510 - ((idx1 + idx2 - 2) / 2) * charSize;
};

const getLeftH = (i: number, row: number) => {
	const idx = getIdxStart(i, row);
	return getCenter(i) + idx * charSize;
};

const getWidth = (i: number, row: number) => {
	const idx1 = getIdxStart(i, row);
	const idx2 = getIdxEnd(i + 1, row);
	return (idx2 - idx1 - 1) * charSize;
};

const getLeftV = (i: number, col: number) => {
	const idx = getIdx(i);
	return getCenter(i) + (idx + col) * charSize + 3;
};

const getTopV = (i: number, col: number, base = 0) => {
	if (lines[base][getIdx(i) + col] != " ") {
		return heightShorts / 2 - 230 + base * 125;
	} else {
		return getTopV(i, col, base + 1);
	}
};

const getBotV = (i: number, col: number, base = 3) => {
	if (lines[base][getIdx(i) + col] != " ") {
		return heightShorts / 2 - 230 + (base + 1) * 125;
	} else {
		return getBotV(i, col, base - 1);
	}
};

const getHeight = (i: number, col: number) => {
	const idx1 = getTopV(i, col);
	const idx2 = getBotV(i, col);
	return idx2 - idx1 - 37;
};

const getCount = (i: number) => getIdx(i + 1) - getIdx(i) - 1;

const HighlightH = ({ i, row }: { i: number; row: number }) => {
	return (
		<Rectangle
			x={getLeftH(i, row)}
			y={heightShorts / 2 - 230 + row * 125}
			w={getWidth(i, row)}
			h={90}
			style={{ background: "#444" }}
		/>
	);
};

const HighlightV = ({ i, col }: { i: number; col: number }) => {
	return (
		<Rectangle
			x={getLeftV(i, col)}
			y={getTopV(i, col)}
			w={charSize - 6}
			h={getHeight(i, col)}
			style={{ background: "#444" }}
		/>
	);
};

export const Day6Short = () => {
	const { values1, values2 } = useMemo(solve, []);
	const time = useCurrentTime();
	const i = time < 8 ? Math.floor(time) : 999 - Math.floor(time - 8);
	const p = (getIdx(i) / maxLineWidth) * 100;
	const p2 = (getIdx(i + 1) / maxLineWidth) * 100;
	const value = time < 8 ? values1[i] : values2[i];
	const count = getCount(i);
	useEffect(() => {
		const f = (n: number) => Math.floor(Math.log(n) * 1.5);
		const innerAudio1 = values1.slice(0, 8).map(({ values, result }) => {
			return (
				"[~ " + values.map((v) => f(v)).join(" ") + ` ~ ${f(result)} ~]`
			);
		});
		const innerAudio2 = values2
			.toReversed()
			.slice(0, 8)
			.map(({ values, result }) => {
				return (
					"[~ [" +
					values.map((v) => f(v)).join(" ") +
					`]@4 ~ ${f(result)} ~]`
				);
			});
		console.log(
			"$: n(`<\n" +
				innerAudio1.join("\n") +
				"\n" +
				innerAudio2.join("\n") +
				">\n`).scale('C3:minor').s('triangle').n(3);",
		);
	}, [values1, values2]);
	return (
		<DayWrapperShorts day={6} title="Trash Compactor" dayDuration={16}>
			<Rectangle
				x={widthShorts / 2 - 10}
				y={heightShorts / 2 - 10}
				w={20}
				h={20}
				style={{ background: "red", opacity: 0 }}
			/>
			{time < 8 && (
				<>
					{time % 1 >= 1 / 8 && <HighlightH i={i} row={0} />}
					{time % 1 >= 2 / 8 && <HighlightH i={i} row={1} />}
					{time % 1 >= 3 / 8 && <HighlightH i={i} row={2} />}
					{time % 1 >= 4 / 8 && <HighlightH i={i} row={3} />}
				</>
			)}
			{time >= 8 &&
				range(0, count).map(
					(_, col) =>
						time % 1 >=
							1 / 8 + (1 / 2 / count) * (count - col - 1) && (
							<HighlightV key={col} i={i} col={col} />
						),
				)}
			<pre
				style={{
					fontFamily: "inherit",
					position: "absolute",
					left: getCenter(i),
					top: heightShorts / 2 + 60,
					transform: "translate(0, -50%)",
					fontSize: 100,
					margin: 0,
					maskImage:
						time < 8 ?
							`linear-gradient(to right, #0004 0%, #0004 ${p}%, #000 ${p}%, #000 100%)`
						:	`linear-gradient(to right, #000 0%, #000 ${p2}%, #0004 ${p2}%, #0004 100%)`,
				}}
			>
				{raw.trim()}
			</pre>
			<pre
				style={{
					fontFamily: "inherit",
					position: "absolute",
					left: getCenter(i),
					top: heightShorts / 2 + 60,
					transform: "translate(0, -50%)",
					fontSize: 100,
					margin: 0,
					color: "#0C0",
					maskImage: `linear-gradient(to right, #0000 ${p}%, #000 ${p}%, #000 ${p2}%, #0000 ${p2}%)`,
				}}
			>
				{raw.trim()}
			</pre>
			{time % 1 >= 6 / 8 && (
				<pre
					style={{
						fontFamily: "inherit",
						position: "absolute",
						left: widthShorts / 2,
						top: heightShorts / 2 + 400,
						transform: "translate(-50%, 0)",
						fontSize: 100,
						margin: 0,
						color: "#0F0",
					}}
				>
					{value.result}
				</pre>
			)}
		</DayWrapperShorts>
	);
};
Day6Short.duration = 16;

/**
setcps(1)

$: s("lt").gain("<0 0.5>").slow(8)

$: n(`<
[~ 9 8 8 9 ~ 36 ~]
[~ 8 13 12 12 ~ 14 ~]
[~ 4 6 6 6 ~ 24 ~]
[~ 5 6 4 6 ~ 8 ~]
[~ 11 13 12 8 ~ 14 ~]
[~ 6 9 10 9 ~ 35 ~]
[~ 5 4 4 5 ~ 20 ~]
[~ 6 6 5 6 ~ 8 ~]
[~ [6 10 13]@4 ~ 29 ~]
[~ [11 12]@4 ~ 13 ~]
[~ [12 13]@4 ~ 13 ~]
[~ [13 12]@4 ~ 26 ~]
[~ [13 13 9]@4 ~ 36 ~]
[~ [12 13 11]@4 ~ 38 ~]
[~ [6 9 8 10]@4 ~ 11 ~]
[~ [1 6 11 13]@4 ~ 13 ~]>
`).scale("<C3:major@8 c3:minor@8>").s('triangle').n(3);
 */
