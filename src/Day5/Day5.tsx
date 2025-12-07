import { useEffect, useMemo, useRef } from "react";
import { interpolate, useVideoConfig } from "remotion";

import { DayProps, DayWrapper } from "../Shorts/DayWrapper";
import { useCurrentTime } from "../common/useCurrentTime";
import { raw } from "./raw";

// const raw = `
// 3-5
// 10-14
// 16-20
// 12-18

// 1
// 5
// 8
// 11
// 17
// 32
// `;

const union2 = (
	range: { start: number; end: number },
	ranges: { start: number; end: number }[],
): { start: number; end: number }[] => {
	const overlapping = ranges.filter(
		(r) => r.end < range.start || range.end < r.start,
	);
	const nonOverlapping = ranges.filter((r) => !overlapping.includes(r));
	const last = {
		start: Math.min(range.start, ...nonOverlapping.map((r) => r.start)),
		end: Math.max(range.end, ...nonOverlapping.map((r) => r.end)),
	};
	return [...overlapping, last];
};

const union3 = (
	ranges: { start: number; end: number }[],
): { start: number; end: number }[] => {
	return ranges.reduce(
		(acc, curr) => union2(curr, acc),
		[] as { start: number; end: number }[],
	);
};

const length = (ranges: { start: number; end: number }[]) => {
	return ranges.reduce((acc, curr) => acc + (curr.end - curr.start + 1), 0);
};

const solve = () => {
	const [a, b] = raw.trim().split("\n\n");
	const ranges = a.split("\n").map((line) => {
		const [start, end] = line.split("-").map(Number);
		return { start, end };
	});
	const ids_ = b.split("\n").map(Number);
	const ids = ids_.map((id) => {
		const fresh = ranges.some(({ start, end }) => id >= start && id <= end);
		return { id, fresh };
	});
	console.log("Part 1:", ids.filter(({ fresh }) => fresh).length);
	console.log(length(union3(ranges)));
	return { ranges, ids, finalRanges: union3(ranges) };
};

export const Day5 = ({ videoType }: DayProps) => {
	const { ranges, ids, finalRanges } = useMemo(solve, []);
	const { width, height } = useVideoConfig();
	const time = useCurrentTime();
	const ref = useRef<HTMLCanvasElement>(null);
	const interval = [0, (1700 / 1920) * height];

	useEffect(() => {
		const ctx = ref.current?.getContext("2d");
		if (!ctx) {
			return;
		}
		ctx.fillStyle = "transparent";
		ctx.clearRect(0, 0, width, height);

		ids.forEach(({ id, fresh }, i) => {
			if (time > 8) {
				return;
			}
			const lastId = interpolate(i, [0, 62], [0.125, 7.875]);
			if (time < lastId) {
				return;
			}
			const y = interpolate(id / Math.pow(10, 12), [0, 500], interval);
			ctx.fillStyle =
				fresh ?
					time < 8 ?
						"#0F0"
					:	"#040"
				: time < 8 ? "#444"
				: "transparent";
			ctx.fillRect(0, y - 1.5, width, 3);
		});

		ranges.forEach(({ start, end }, i) => {
			const x = interpolate(
				i,
				[0, ranges.length - 1],
				[200, width - 200],
			);
			const y1 = interpolate(
				start / Math.pow(10, 12),
				[0, 500],
				interval,
			);
			const y2 = interpolate(end / Math.pow(10, 12), [0, 500], interval);
			ctx.fillStyle = "#FFF";
			ctx.beginPath();
			ctx.roundRect(x - 2.5, y1, 5, y2 - y1, 5);
			ctx.fill();
		});

		finalRanges.forEach(({ start, end }, i) => {
			const y1 = interpolate(
				start / Math.pow(10, 12),
				[0, 500],
				interval,
			);
			const y2 = interpolate(end / Math.pow(10, 12), [0, 500], interval);
			const wide =
				interpolate(i, [0, finalRanges.length], [8.125, 15.875]) < time;
			if (!wide) {
				return;
			}
			ctx.fillStyle = wide ? "#0C0" : "#FFF";
			ctx.fillRect(0, y1, width, y2 - y1);
		});
	}, [time, finalRanges, ranges, ids]);

	useEffect(() => {
		const f = (n: number) =>
			Math.floor(interpolate(n / Math.pow(10, 12), [0, 500], [0, 12]));
		const audio =
			"$: n(`\n[~ " +
			ids
				.slice(0, 62)
				.map(({ id, fresh }) => (fresh ? f(id) : "~"))
				.join(" ") +
			" ~]\n[~ [" +
			finalRanges
				// .slice(0, 62)
				.map(({ start, end }) => f((start + end) / 2))
				.join(" ") +
			']@62 ~]\n`).scale("c3:minor").gain("1 [1 [' +
			finalRanges
				// .slice(0, 62)
				.map(({ start, end }) =>
					(((end - start) / Math.pow(10, 13)) * 2).toFixed(2),
				)
				.join(" ") +
			']@62 1]").s("sine triangle").slow(16);';
		console.log(audio);
	}, []);

	return (
		<DayWrapper videoType={videoType} day={5} title="Cafeteria">
			<canvas
				width={width}
				height={height}
				ref={ref}
				style={{ position: "absolute" }}
			/>
		</DayWrapper>
	);
};

/**

setcps(1)

$: s("lt").gain("<0 0.5>").slow(8)

_$: s("bd").gain(0.5)

$: n(`
[~ ~ 7 1 6 9 8 ~ 9 12 9 ~ ~ 5 ~ 0 ~ ~ 2 2 5 ~ ~ ~ 11 ~ 9 2 10 2 9 8 ~ ~ ~ 11 6 7 4 1 5 ~ ~ ~ 13 ~ 9 ~ 8 5 0 9 ~ ~ 13 3 6 ~ ~ 10 4 6 3 ~]
[~ [5 0 2 5 8 10 6 9 3 4 8 10 11 7 12 13 10 10 7 3 10 1 2 3 9 10 2 12 3 5 12 0 11 2 5 4 11 2 0 6 4 7 7 5 2 10 2 9 0 12 1 6 12 10 10 3 1 2 8 13 4 1 10 5 9 9 9 11 6 6 9 12 10 9 6 7 13 3 1 0 8 2 0 10 6 4 9 10 2 9 7 9 6 10]@62 ~]
`).scale("c3:minor").gain("[1] [1 [0.00 0.00 0.07 1.40 1.02 0.00 0.11 0.55 0.56 0.88 1.60 0.03 0.85 0.00 1.75 0.56 0.09 1.36 0.81 0.50 0.16 0.78 0.09 1.62 0.98 1.00 0.08 0.00 0.79 1.84 1.29 0.89 0.81 0.35 0.00 1.25 1.33 1.38 0.83 0.15 1.49 1.26 1.30 0.45 1.06 0.05 0.80 0.14 0.74 0.70 0.83 1.33 0.84 0.18 0.09 0.52 0.81 0.16 1.54 0.67 1.69 1.33 1.34 1.68 0.12 0.18 0.08 1.89 0.22 0.10 1.24 0.35 0.19 0.42 0.67 0.83 1.45 1.92 1.88 0.00 0.90 0.22 1.00 1.31 0.62 0.44 1.29 0.00 0.45 0.35 1.96 0.14 1.51 0.06]@62 1]").s("sine triangle").slow(16);

 */
