import { useMemo } from "react";
import { interpolate } from "remotion";

import { DayWrapperFull } from "../FullVideo/DayWrapperFull";
import { DayWrapperPartial } from "../FullVideo/DayWrapperPartial";
import { DayWrapperShorts } from "../Shorts/DayWrapperShorts";
import { Translate } from "../common/Translate";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp, height, heightShorts } from "../constants";
import { raw } from "./raw";

const digits = [
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
];

const getFirstDigit = (line: string, part: 1 | 2): number => {
	if (line.length === 0) {
		throw new Error("getFirstDigit");
	}
	for (let k = 1; k <= 9; k++) {
		if (
			line.startsWith(`${k}`) ||
			(part === 2 && line.startsWith(digits[k - 1]))
		) {
			return k;
		}
	}
	return getFirstDigit(line.slice(1), part);
};

const getLastDigit = (line: string, part: 1 | 2): number => {
	if (line.length === 0) {
		throw new Error("getLastDigit");
	}
	for (let k = 1; k <= 9; k++) {
		if (
			line.endsWith(`${k}`) ||
			(part === 2 && line.endsWith(digits[k - 1]))
		) {
			return k;
		}
	}
	return getLastDigit(line.slice(0, line.length - 1), part);
};

const solve = () => {
	const parsed = raw.split("\n");
	let result = 0;
	for (const line of parsed) {
		const a = getFirstDigit(line, 1);
		const b = getLastDigit(line, 1);
		result += a * 10 + b;
	}
	console.log(`Day 1, part 1: ${result}`);

	result = 0;

	for (const line of parsed) {
		const a = getFirstDigit(line, 2);
		const b = getLastDigit(line, 2);
		result += a * 10 + b;
	}
	console.log(`Day 1, part 2: ${result}`);
};

const data = [...raw.split("\n"), ...raw.split("\n")];

const color = "#00CC00";
const styles = [
	{},
	{
		color: "#FFFFFF",
		textShadow: "0 0 10px #ffffff",
	},
	{
		color,
		textShadow: `0 0 4px ${color}, 0 0 10px ${color}`,
	},
];

const process = (data: string[], part: 1 | 2) => {
	return data.map((line) => {
		const params = line.split("").map(() => 0);
		const regexp = {
			1: /[0123456789]/g,
			2: /[0123456789]|one|two|three|four|five|six|seven|eight|nine/g,
		}[part];
		const matches = [...line.matchAll(regexp)];
		for (const match of matches) {
			const isFirst = match === matches[0];
			const isLast = match === matches.at(-1);
			for (let k = 0; k < match[0].length; k++) {
				params[(match.index as number) + k] = isFirst || isLast ? 2 : 1;
			}
		}

		return { line, params };
	});
};

const DataLine = ({
	processed,
	process,
}: {
	processed: { line: string; params: number[] };
	process: boolean;
}) => {
	if (!process) {
		return <div>{processed.line}</div>;
	}
	return (
		<div>
			{processed.line.split("").map((c, i) => (
				<span key={i} style={styles[processed.params[i]]}>
					{c}
				</span>
			))}
		</div>
	);
};

const Day1Page = ({
	i,
	spacing,
	processedPart,
	height,
	marginTop,
	marginBottom,
}: {
	i: number;
	spacing: number;
	processedPart: { line: string; params: number[] };
	height: number;
	marginTop: number;
	marginBottom: number;
}) => {
	const time = useCurrentTime();
	const block = Math.floor(time);
	const blockRatio = time - block;
	const delta = 0.15;
	const t = interpolate(blockRatio, [delta, 1 - delta], [0, 1], clamp);
	const process = i < (block + t) * 25;
	let dy = i * spacing - height * block;
	if (dy < 0 || dy >= height) {
		return null;
	}
	dy = interpolate(dy, [0, height], [marginTop, height - marginBottom]);
	return (
		<Translate key={i} dy={dy}>
			<DataLine processed={processedPart} process={process} />
		</Translate>
	);
};

const Day1Pages = ({
	height,
	marginTop,
	marginBottom,
}: {
	height: number;
	marginTop: number;
	marginBottom: number;
}) => {
	const spacing = height / 25;
	const time = useCurrentTime();
	const isPart1 = time % 16 < 8;
	const processedPart1 = useMemo(() => process(data, 1), []);
	const processedPart2 = useMemo(() => process(data, 2), []);

	return data.map((_, i) => (
		<Day1Page
			i={i}
			spacing={spacing}
			processedPart={isPart1 ? processedPart1[i] : processedPart2[i]}
			height={height}
			marginTop={marginTop}
			marginBottom={marginBottom}
		/>
	));
};

export const Day1Short = () => {
	return (
		<DayWrapperShorts
			day={1}
			title="Trebuchet?!"
			dayDuration={16}
			style={{
				fontSize: 31,
				textAlign: "center",
			}}
		>
			<Day1Pages
				height={heightShorts}
				marginTop={30}
				marginBottom={150}
			/>
		</DayWrapperShorts>
	);
};
Day1Short.duration = 16;

export const Day1Full = () => {
	let str = "";
	for (let i = 0; i < 80; i++) {
		str += "[";
		str += data
			.slice(i * 25, (i + 1) * 25)
			.map((x) => x.length)
			.join(" ");
		str += "]\n";
	}
	console.log(str);
	return (
		<DayWrapperFull
			day={1}
			dayDuration={32}
			style={{
				fontSize: 28,
				textAlign: "center",
			}}
		>
			<Day1Pages height={height} marginTop={0} marginBottom={0} />
		</DayWrapperFull>
	);
};
Day1Full.duration = 80;

export const Day1Partial = () => {
	return (
		<DayWrapperPartial
			day={1}
			title="Trebuchet?!"
			style={{
				fontSize: 28,
				textAlign: "center",
			}}
		>
			<Day1Pages height={height} marginTop={0} marginBottom={0} />
		</DayWrapperPartial>
	);
};
Day1Partial.duration = 16;

/*

$: s("lt").gain("<1.5 1>").slow(4)

$: s("bd").fast(2).gain(0.5)

_$: note("0 2 4 - 0 4 4 - 4 0 2 -".slow(2).add(0).scale("C:minor")).sound("gm_acoustic_bass").gain(0.5)

$: note(`<
[14 32 6 37 26 14 14 21 17 29 29 23 12 32 9 6 14 23 25 3 13 7 17 20 27]
[19 12 22 22 23 20 19 15 16 29 32 16 12 16 15 30 16 11 30 11 12 19 6 16 5]
[37 7 49 16 29 34 41 18 36 34 17 11 17 9 35 28 8 16 34 17 26 13 10 26 18]
[20 34 29 17 25 15 16 31 44 23 21 5 12 12 34 21 8 8 9 12 12 18 29 21 20]
[15 20 12 8 20 16 29 49 28 10 27 25 8 23 27 26 10 22 31 18 30 27 14 33 33]
[48 3 23 27 31 15 30 8 5 41 26 8 17 24 31 18 19 49 20 27 17 25 16 9 14]
[11 34 21 15 31 14 30 16 25 22 36 13 18 14 5 16 20 10 10 22 24 7 19 22 38]
[25 12 22 22 20 25 26 19 13 24 23 19 17 40 11 12 30 7 29 6 12 28 14 36 16]
[29 17 27 6 7 9 29 15 15 7 30 34 15 20 13 4 26 6 31 38 32 11 40 19 27]
[43 49 18 27 37 9 14 5 14 20 19 19 10 15 13 7 11 5 16 24 30 23 16 7 9]
[18 23 33 10 10 10 18 5 25 5 22 12 11 14 18 14 8 27 25 29 18 16 9 11 28]
[15 19 11 23 30 8 11 24 9 13 17 29 17 13 8 8 5 24 24 15 24 29 32 11 29]
[18 16 6 14 16 7 6 21 26 22 10 11 25 6 23 34 20 33 40 10 36 19 23 12 23]
[4 33 35 47 9 11 35 40 28 18 16 25 15 13 29 33 13 16 39 13 22 28 22 6 21]
[23 28 18 9 7 27 19 32 28 25 16 11 36 4 26 25 28 7 15 10 12 6 41 8 4]
[43 35 15 16 20 25 15 44 23 16 8 27 27 13 9 20 24 36 19 26 23 8 11 18 30]
>`.scale("<C1:minor@8 C1:major@8>").compress(.15, .85)).s("triangle").lpf("<500@8 3000@8>").fast(2)._spectrum()

 */
