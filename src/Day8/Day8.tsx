import { useCallback, useEffect, useMemo } from "react";
import { interpolate, useVideoConfig } from "remotion";

import { DayProps, DayWrapper } from "../Shorts/DayWrapper";
import { Canvas } from "../common/Canvas";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp } from "../constants";
import { raw } from "./raw";

// const raw = `
// 162,817,812
// 57,618,57
// 906,360,560
// 592,479,940
// 352,342,300
// 466,668,158
// 542,29,236
// 431,825,988
// 739,650,466
// 52,470,668
// 216,146,977
// 819,987,18
// 117,168,530
// 805,96,715
// 346,949,466
// 970,615,88
// 941,993,340
// 862,61,35
// 984,92,344
// 425,690,689
// `;

const distance = (p: number[], q: number[]) => {
	return (
		Math.pow(p[0] - q[0], 2) +
		Math.pow(p[1] - q[1], 2) +
		Math.pow(p[2] - q[2], 2)
	);
};

const solve = (count: number) => {
	const points = raw
		.trim()
		.split("\n")
		.map((line) => line.split(",").map((v) => parseInt(v, 10)));
	const pairs = points.flatMap((p, i) =>
		points.slice(0, i).map((q) => [p, q]),
	);
	pairs.sort((a, b) => distance(a[0], a[1]) - distance(b[0], b[1]));

	const circuits: number[][][] = [];
	const circuitIndex = new WeakMap<number[], number>();

	const processPair = (p: number[], q: number[]) => {
		const i1 = circuitIndex.get(p);
		const i2 = circuitIndex.get(q);
		if (i1 === undefined && i2 === undefined) {
			const newIndex = circuits.length;
			circuits.push([p, q]);
			circuitIndex.set(p, newIndex);
			circuitIndex.set(q, newIndex);
		} else if (i1 !== undefined && i2 === undefined) {
			circuits[i1].push(q);
			circuitIndex.set(q, i1);
		} else if (i1 === undefined && i2 !== undefined) {
			circuits[i2].push(p);
			circuitIndex.set(p, i2);
		} else if (i1 !== i2 && i1 !== undefined && i2 !== undefined) {
			const circuit1 = circuits[i1];
			const circuit2 = circuits[i2];
			circuits[i1] = circuit1.concat(circuit2);
			for (const point of circuit2) {
				circuitIndex.set(point, i1);
			}
			circuits[i2] = [];
		}
	};

	let i = 0;
	const bestThreeCircuits = [];
	for (const [p, q] of pairs) {
		if (i >= count) {
			break;
		}
		processPair(p, q);
		i++;
		bestThreeCircuits.push(
			circuits
				.toSorted((a, b) => b.length - a.length)
				.slice(0, 3)
				.map((c) => c.slice()),
		);
	}

	const part1Lengths = circuits.map((c) => c.length).sort((a, b) => b - a);
	console.log("Part 1:", part1Lengths[0] * part1Lengths[1] * part1Lengths[2]);

	i = 0;
	for (const [p, q] of pairs) {
		if (i < count) {
			i++;
			continue;
		}
		processPair(p, q);
		i++;
		bestThreeCircuits.push(
			circuits
				.toSorted((a, b) => b.length - a.length)
				.slice(0, 3)
				.map((c) => c.slice()),
		);
		if (circuits.some((c) => c.length == points.length)) {
			console.log("Part 2:", p[0] * q[0], `(${i} pairs)`);
			break;
		}
	}
	bestThreeCircuits.push(
		circuits
			.toSorted((a, b) => b.length - a.length)
			.slice(0, 3)
			.map((c) => c.slice()),
	);

	return { points, pairs, bestThreeCircuits, lastCount: i };
};

export const Day8 = ({ videoType }: DayProps) => {
	const { points, pairs, bestThreeCircuits, lastCount } = useMemo(
		() => solve(1000),
		[],
	);
	const time = useCurrentTime();
	const { width, height } = useVideoConfig();

	useEffect(() => {
		const convert1 = (c: number[][]) => `${c.length / 4}`;
		const lines1 = bestThreeCircuits
			.slice(0, 1000)
			.filter(
				(_, i) =>
					Math.floor(((i + 1) / 1000) * 128) >
					Math.floor((i / 1000) * 128),
			)
			.map(
				([c1, c2, c3]) =>
					`[${convert1(c1)}, ${convert1(c2)}, ${convert1(c3)}]`,
			);
		// console.log(
		// 	bestThreeCircuits
		// 		.slice(1000, lastCount)
		// 		.filter(
		// 			(_, i) =>
		// 				Math.floor(((i + 1) / (lastCount - 1000)) * 64) >
		// 				Math.floor((i / (lastCount - 1000)) * 64),
		// 		),
		// );
		const lines2 = bestThreeCircuits
			.slice(1000, lastCount)
			.filter(
				(_, i) =>
					Math.floor(((i + 1) / (lastCount - 1000)) * 120) >
					Math.floor((i / (lastCount - 1000)) * 120),
			)
			// .map(([c1]) => `${(1000 - c1.length) / 5}`);
			.map(
				([c1]) =>
					`${(Math.log(Math.max(1, 1000 - c1.length)) * 3).toFixed(2)}`,
			);
		const last = lines2[lines2.length - 1];
		lines2.push(last, last, last, last, last, last, last, last);

		const dedup = (lines: string[], factor: number) =>
			lines.flatMap((line, i) => {
				if (lines[i - 1] == line) {
					return [];
				} else {
					const count =
						(lines.findIndex((l, j) => l != line && j > i) + 1 ||
							lines.length + 1) -
						1 -
						i;
					return [`${line}@${count * factor}`];
				}
			});
		console.log(
			"$: n(`<\n" +
				dedup(lines1, 1).join("\n") +
				"\n\n" +
				dedup(lines2, 1).join("\n") +
				'\n>`).fast(16).sound("triangle").scale("c2:minor")',
		);
	}, []);

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			ctx.fillStyle = "#FFF";
			const rotationA = time * 0.25;
			const rotationB = 0.4; //time / 2;
			const rotationC = time * 0;
			const rotate2d = ([x, y]: [number, number], angle: number) => {
				return [
					Math.cos(angle) * x - Math.sin(angle) * y,
					Math.sin(angle) * x + Math.cos(angle) * y,
				];
			};
			const convertPosition = ([x, y, z]: number[]) => {
				const maxValue = 100000;
				x = x - maxValue / 2;
				y = y - maxValue / 2;
				z = z - maxValue / 2;
				[x, z] = rotate2d([x, z], rotationA);
				[y, z] = rotate2d([y, z], rotationB);
				[x, y] = rotate2d([x, y], rotationC);
				const padding = 20;
				const size = Math.min(width, height) / Math.SQRT2 - padding;
				const minX = (width - size * Math.SQRT2) / 2;
				const maxX = (width + size * Math.SQRT2) / 2;
				const minY = (height - size * Math.SQRT2) / 2;
				const maxY = (height + size * Math.SQRT2) / 2;
				return [
					interpolate(
						x,
						[
							(-maxValue * Math.SQRT2) / 2,
							(maxValue * Math.SQRT2) / 2,
						],
						[minX, maxX],
						clamp,
					),
					interpolate(
						y,
						[
							(-maxValue * Math.SQRT2) / 2,
							(maxValue * Math.SQRT2) / 2,
						],
						[minY, maxY],
						clamp,
					),
					z,
				];
			};

			type ToDraw =
				| {
						type: "point";
						pos: number[];
						z: number;
						size: number;
						color: string;
				  }
				| {
						type: "line";
						from: number[];
						to: number[];
						z: number;
						lineWidth: number;
						color: string;
				  };
			const toDraw: ToDraw[] = [];

			const isPart1 = time < 8;
			const maxI = interpolate(
				time,
				[0, 8, 15.5],
				[0, 1000, lastCount],
				clamp,
			);
			for (const point of points) {
				if (
					pairs
						.slice(0, maxI)
						.some((pair) => pair[0] === point || pair[1] === point)
				) {
					continue;
				}
				const pos = convertPosition(point);
				toDraw.push({
					type: "point",
					pos,
					z: pos[2],
					size: 2,
					color: "#CCC",
				});
			}

			let i = 0;
			for (const pair of pairs) {
				if (i >= maxI) {
					break;
				}
				const from = convertPosition(pair[0]);
				const to = convertPosition(pair[1]);
				ctx.beginPath();
				const circuits = bestThreeCircuits[Math.floor(maxI)] || [];
				const j = circuits.findIndex((circuit) =>
					circuit.includes(pair[0]),
				);
				let color = "";
				let lineWidth = 1;
				switch (j) {
					case 0:
						color = isPart1 ? "#0F0" : "#0C0";
						lineWidth = isPart1 ? 3 : 3;
						break;
					case 1:
						color = isPart1 ? "#0FC" : "#FFF";
						lineWidth = isPart1 ? 3 : 2;
						break;
					case 2:
						color = isPart1 ? "#CF0" : "#FFF";
						lineWidth = isPart1 ? 3 : 2;
						break;
					default:
						color = isPart1 ? "#CCC" : "#FFF";
						lineWidth = isPart1 ? 2 : 2;
				}
				toDraw.push({
					type: "line",
					from,
					to,
					z: (from[2] + to[2]) / 2,
					lineWidth,
					color,
				});
				i++;
			}

			toDraw.sort((a, b) => b.z - a.z);
			ctx.lineCap = "round";
			for (const item of toDraw) {
				ctx.beginPath();
				if (item.type == "point") {
					ctx.fillStyle = item.color;
					ctx.arc(
						item.pos[0],
						item.pos[1],
						item.size,
						0,
						2 * Math.PI,
						false,
					);
					ctx.fill();
				} else {
					ctx.strokeStyle = item.color;
					ctx.lineWidth = item.lineWidth;
					ctx.moveTo(item.from[0], item.from[1]);
					ctx.lineTo(item.to[0], item.to[1]);
					ctx.stroke();
				}
			}
		},
		[points, time, width, height],
	);

	return (
		<DayWrapper videoType={videoType} day={8} title="Playground">
			<Canvas draw={draw} />
		</DayWrapper>
	);
};
