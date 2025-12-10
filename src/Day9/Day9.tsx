import { useCallback, useEffect, useMemo } from "react";
import { interpolate, useVideoConfig } from "remotion";

import { DayProps, DayWrapper } from "../Shorts/DayWrapper";
import { Canvas } from "../common/Canvas";
import { range } from "../common/range";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp } from "../constants";
import data from "./data.json";
import { raw } from "./raw";

// const raw = `
// 7,1
// 11,1
// 11,7
// 9,7
// 9,5
// 2,5
// 2,3
// 7,3
// `;

const solve = () => {
	const points = raw
		.trim()
		.split("\n")
		.map((line) => {
			const [x, y] = line.split(",").map(Number);
			return { x, y };
		});

	let bestArea = 0;
	const part1Tries: {
		p: { x: number; y: number };
		q: { x: number; y: number };
		area: number;
	}[] = [];
	for (const p of points) {
		for (const q of points) {
			const area = Math.abs(p.x - q.x + 1) * Math.abs(p.y - q.y + 1);
			part1Tries.push({ p, q, area });
			if (area > bestArea) {
				bestArea = area;
			}
		}
	}
	part1Tries.sort((a, b) => b.area - a.area);
	console.log("Part 1:", bestArea);

	// Part 2

	const getIntersectionsH = (x1: number, x2: number, y: number) => {
		let intersections: { x: number; y: number }[] = [];
		points.forEach((point, i) => {
			const nextPoint = points[(i + 1) % points.length];
			if (point.y == nextPoint.y) {
				return;
			}
			if (point.y > y && nextPoint.y > y) {
				return;
			}
			if (point.y < y && nextPoint.y < y) {
				return;
			}
			if (x1 > point.x && x2 > point.x) {
				return;
			}
			if (x1 < point.x && x2 < point.x) {
				return;
			}
			intersections.push({ x: point.x, y });
		});
		return intersections;
	};
	const getIntersectionsV = (x: number, y1: number, y2: number) => {
		let intersections: { x: number; y: number }[] = [];
		points.forEach((point, i) => {
			const nextPoint = points[(i + 1) % points.length];
			if (point.x == nextPoint.x) {
				return;
			}
			if (point.x > x && nextPoint.x > x) {
				return;
			}
			if (point.x < x && nextPoint.x < x) {
				return;
			}
			if (y1 > point.y && y2 > point.y) {
				return;
			}
			if (y1 < point.y && y2 < point.y) {
				return;
			}
			intersections.push({ x, y: point.y });
		});
		return intersections;
	};
	const getIntersections = (
		from: { x: number; y: number },
		to: { x: number; y: number },
	) => {
		if (from.x == to.x) {
			return getIntersectionsV(from.x, from.y, to.y);
		} else if (from.y == to.y) {
			return getIntersectionsH(from.x, to.x, to.y);
		} else {
			throw new Error("Diagonal line?");
		}
	};
	const isPointInside = (point: { x: number; y: number }) => {
		const flips = getIntersections(
			{ x: point.x + 0.1, y: 0.1 },
			{ x: point.x + 0.1, y: point.y + 0.1 },
		);
		return flips.length % 2 == 1;
	};
	const isPointOnBoundary = (point: { x: number; y: number }) => {
		return points.some((p, i) => {
			const q = points[(i + 1) % points.length];
			if (
				p.x == q.x &&
				p.x == point.x &&
				point.y >= Math.min(p.y, q.y) &&
				point.y <= Math.max(p.y, q.y)
			) {
				return true;
			}
			if (
				p.y == q.y &&
				p.y == point.y &&
				point.x >= Math.min(p.x, q.x) &&
				point.x <= Math.max(p.x, q.x)
			) {
				return true;
			}
			return false;
		});
	};
	const isPointValid = (point: { x: number; y: number }) => {
		return isPointInside(point) || isPointOnBoundary(point);
	};

	const isLineValid = (
		from: { x: number; y: number },
		to: { x: number; y: number },
	) => {
		// if (!isPointValid(from) || !isPointValid(to)) {
		// 	return false;
		// }
		const intersections = getIntersections(from, to);
		const baseToCheck = [...intersections, from, to];
		baseToCheck.sort((a, b) => a.x - b.x || a.y - b.y);
		const toCheck = baseToCheck.flatMap((point, i) => {
			if (i == baseToCheck.length - 1) {
				return [point];
			}
			const nextPoint = baseToCheck[i + 1];
			if (point.x == nextPoint.x && nextPoint.y > point.y) {
				return [
					point,
					{ x: point.x, y: Math.min(nextPoint.y, point.y + 1) },
					{ x: point.x, y: Math.max(nextPoint.y, point.y - 1) },
				];
			} else if (point.y == nextPoint.y) {
				return [
					point,
					{ x: Math.min(nextPoint.x, point.x + 1), y: point.y },
					{ x: Math.max(nextPoint.x, point.x - 1), y: point.y },
				];
			} else {
				throw new Error("Diagonal line?");
			}
		});
		// console.log({ from, to, toCheck });
		if (toCheck.length == 0) {
			throw new Error("nothing to check");
		}
		return toCheck.every(
			(point) =>
				((from.x == to.x &&
					from.x == point.x &&
					point.y >= Math.min(from.y, to.y) &&
					point.y <= Math.max(from.y, to.y)) ||
					(from.y == to.y &&
						from.y == point.y &&
						point.x >= Math.min(from.x, to.x) &&
						point.x <= Math.max(from.x, to.x))) &&
				isPointValid(point),
		);
	};

	let str = "";
	// const pt = points[Math.floor(Math.random() * points.length)];
	for (let y = 1; y <= 9; y++) {
		for (let x = 0; x <= 20; x++) {
			// for (let y = pt.y - 100; y <= pt.y + 100; y++) {
			// 	for (let x = pt.x - 100; x <= pt.x + 100; x++) {
			if (isPointOnBoundary({ x, y })) {
				str += "#";
			} else if (isPointInside({ x, y })) {
				str += "O";
			} else {
				str += ".";
			}
		}
		str += "\n";
	}
	console.log(str);

	bestArea = 0;
	const part2Tries: {
		p: { x: number; y: number };
		q: { x: number; y: number };
		area: number;
	}[] = [];
	for (const p of points) {
		for (const q of points) {
			const r = { x: p.x, y: q.y };
			const s = { x: q.x, y: p.y };
			const area = (Math.abs(p.x - q.x) + 1) * (Math.abs(p.y - q.y) + 1);
			if (
				!isLineValid(p, r) ||
				!isLineValid(r, q) ||
				!isLineValid(q, s) ||
				!isLineValid(s, p)
			) {
				continue;
			}
			part2Tries.push({ p, q, area });
			if (area > bestArea) {
				bestArea = area;
			}
		}
	}
	part2Tries.sort((a, b) => b.area - a.area);

	console.log("Part 2:", bestArea);
	console.log(JSON.stringify({ points, part1Tries, part2Tries }));
	return { points, part1Tries, part2Tries };
};

export const Day9 = ({ videoType }: DayProps) => {
	const { points, part1Tries, part2Tries } = data as ReturnType<typeof solve>;
	const time = useCurrentTime();
	const { width, height } = useVideoConfig();

	useEffect(() => {
		const part1 =
			"0 " +
			range(1, 30)
				.map((i) => {
					const idx =
						(30 - i) * Math.floor((part1Tries.length - 1) / 30);
					return Math.floor(
						Math.log(part1Tries[idx].area) * 2 - 30.2,
					);
				})
				.join(" ") +
			"@3\n";
		const part2 =
			range(0, 30)
				.map((i) => {
					const idx = (30 - i) * 32;
					return Math.floor(
						Math.log(part2Tries[idx].area) * 3 - 30.2 - 18,
					);
				})
				.join(" ") + "@3\n";

		console.log(part1 + "\n" + part2);
		// const i =
		// 	Math.ceil(interpolate(time % 8, [0, 7.5], [30, 0], clamp)) *
		// 		(isPart1 ? Math.floor((tries.length - 1) / 30) : 32);
	}, [part1Tries]);

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			const convertPos = ({ x, y }: { x: number; y: number }) => {
				const size = Math.min(width, height) - 300;
				return {
					x: (x / 100000 - 1 / 2) * size + width / 2,
					y: (y / 100000 - 1 / 2) * size + height / 2,
				};
			};
			const isPart1 = time < 8;

			if (!isPart1) {
				ctx.strokeStyle = "#FFF";
				ctx.fillStyle = "#060";
				ctx.lineWidth = 0;
				ctx.beginPath();
				const { x, y } = convertPos(points[points.length - 1]);
				ctx.moveTo(x, y);
				for (const point of points) {
					const { x, y } = convertPos(point);
					ctx.lineTo(x, y);
				}
				ctx.fill();
			}
			ctx.fillStyle = "#C00";
			for (const point of points) {
				const { x, y } = convertPos(point);
				ctx.beginPath();
				ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
				ctx.fill();
			}

			const tries = isPart1 ? part1Tries : part2Tries;
			const i =
				Math.ceil(interpolate(time % 8, [0, 7.5], [30, 0], clamp)) *
				(isPart1 ? Math.floor((tries.length - 1) / 30) : 32);
			ctx.fillStyle = isPart1 ? "#CCC8" : "#CCCC";
			const p = convertPos(tries[i].p);
			const q = convertPos(tries[i].q);
			ctx.fillRect(
				Math.min(p.x, q.x),
				Math.min(p.y, q.y),
				Math.abs(q.x - p.x),
				Math.abs(q.y - p.y),
			);
			ctx.fillStyle = "#C00";
			for (const point of [p, q]) {
				const { x, y } = point;
				ctx.beginPath();
				ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
				ctx.fill();
			}

			// console.log(part1Tries, part2Tries);
		},
		[points, time, width, height],
	);

	return (
		<DayWrapper videoType={videoType} day={9} title="Movie Theater">
			<Canvas draw={draw} />
		</DayWrapper>
	);
};
