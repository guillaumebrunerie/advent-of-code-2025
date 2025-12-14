import { useCallback, useEffect, useMemo } from "react";
import { interpolate, useVideoConfig } from "remotion";

import { DayProps, DayWrapper } from "../Shorts/DayWrapper";
import { Canvas } from "../common/Canvas";
import { range } from "../common/range";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp } from "../constants";
import { raw } from "./raw";

// const raw = `
// svr: aaa bbb
// aaa: fft
// fft: ccc
// bbb: tty
// tty: ccc
// ccc: ddd eee
// ddd: hub
// hub: fff
// eee: dac
// dac: fff
// fff: ggg hhh
// ggg: out
// hhh: out
// `;

const solve = () => {
	const graph = new Map<string, string[]>();
	for (const line of raw.trim().split("\n")) {
		const [node, edges] = line.split(": ");
		graph.set(node, edges.split(" "));
	}

	const cache = new Map<string, number>();
	const countPaths = (
		from: string,
		to: string,
		hasDac = false,
		hasFft = false,
	) => {
		const key = `${from}-${to}-${hasDac}-${hasFft}`;
		const cached = cache.get(key);
		if (cached != undefined) {
			return cached;
		}
		if (from == to) {
			if (hasDac && hasFft) {
				return 1;
			} else {
				return 0;
			}
		}
		let count = 0;
		for (const node of graph.get(from)!) {
			count += countPaths(
				node,
				to,
				hasDac || from == "dac",
				hasFft || from == "fft",
			);
		}
		cache.set(key, count);
		return count;
	};

	const ys = new Map<string, number>();
	const calculateYs = (node: string, y: number) => {
		if (ys.has(node) && ys.get(node)! >= y) {
			return;
		}
		ys.set(node, y);
		for (const neighbor of graph.get(node) || []) {
			calculateYs(neighbor, y + 1);
		}
	};
	const counts = new Map<number, number>();
	const nodes = new Map<string, { x: number; y: number }>();
	const calculateXs = (node: string) => {
		if (nodes.has(node)) {
			return;
		}
		const y = ys.get(node)!;
		const x = counts.get(y) || 0;
		nodes.set(node, { x, y });
		counts.set(y, x + 1);
		for (const neighbor of graph.get(node) || []) {
			calculateXs(neighbor);
		}
	};
	calculateYs("svr", 0);
	calculateXs("svr");

	const cache2 = new Map<string, boolean>();
	const hasPath = (from: string, to: string) => {
		const key = `${from}-${to}`;
		const cached = cache2.get(key);
		if (cached != undefined) {
			return cached;
		}
		if (from == to) {
			return true;
		}
		for (const node of graph.get(from) || []) {
			if (hasPath(node, to)) {
				cache2.set(key, true);
				return true;
			}
		}
		cache2.set(key, false);
		return false;
	};

	const part1Nodes = new Set<string>();
	const part2Nodes = new Set<string>();
	for (const [node, y] of ys) {
		const dfft = ys.get("fft")!;
		const ddac = ys.get("dac")!;
		const dyou = ys.get("you")!;
		if (y < dfft && hasPath("svr", node) && hasPath(node, "fft")) {
			part2Nodes.add(node);
		} else if (y == dfft && node == "fft") {
			part2Nodes.add(node);
		} else if (
			y > dfft &&
			y < ddac &&
			hasPath("fft", node) &&
			hasPath(node, "dac")
		) {
			part2Nodes.add(node);
		} else if (y == ddac && node == "dac") {
			part2Nodes.add(node);
		} else if (y > ddac && hasPath("dac", node) && hasPath(node, "out")) {
			part2Nodes.add(node);
		}
		if (y == dyou && node == "you") {
			part1Nodes.add(node);
		} else if (y > dyou && hasPath(node, "out") && hasPath("you", node)) {
			part1Nodes.add(node);
		}
	}

	console.log("Part 1:", countPaths("svr", "out"));
	return { graph, nodes, counts, part1Nodes, part2Nodes };
};

export const Day11 = ({ videoType }: DayProps) => {
	const { graph, nodes, counts, part1Nodes, part2Nodes } = useMemo(solve, []);
	const time = useCurrentTime();
	const { width, height } = useVideoConfig();

	useEffect(() => {
		const minY = nodes.get("you")!.y;
		const maxY = nodes.get("out")!.y;
		let audio1 = "";
		for (let yy = minY; yy <= maxY; yy++) {
			const count = nodes
				.entries()
				.filter(([key, { y }]) => y == yy && part1Nodes.has(key))
				.toArray().length;
			audio1 += ` ${count}`;
		}
		console.log(
			`$: n(\`<\n~@0.5${audio1}@0.5\n>\`).scale("c2:minor").sound("triangle").gain("1 0".slow(16))`,
		);
		let audio2 = "";
		for (let yy = 0; yy <= maxY; yy++) {
			const count = nodes
				.entries()
				.filter(([key, { y }]) => y == yy && part2Nodes.has(key))
				.toArray().length;
			audio2 += ` ${count}`;
		}
		console.log(
			`$: n(\`<\n~!7${audio2}\n>\`).fast(6).scale("c3:minor").sound("triangle").gain("0 1".slow(16))`,
		);
	}, [graph, nodes, counts, part1Nodes, part2Nodes]);

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			const nodeRadius = 10;
			const drawNode = (
				{ x, y }: { x: number; y: number },
				superHighlighted: boolean,
				highlighted = false,
			) => {
				ctx.strokeStyle = "#CCC";
				ctx.fillStyle =
					superHighlighted ? "#0F0"
					: highlighted ? "#080"
					: "#444";
				ctx.lineWidth = 0;
				ctx.beginPath();
				ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
				ctx.fill();
			};
			const drawEdge = (
				from: { x: number; y: number },
				to: { x: number; y: number },
				highlighted: boolean,
				a: number,
				b: number,
			) => {
				ctx.strokeStyle = highlighted ? "#060" : "#333";
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(
					from.x + a * (to.x - from.x),
					from.y + a * (to.y - from.y),
				);
				ctx.lineTo(
					from.x + b * (to.x - from.x),
					from.y + b * (to.y - from.y),
				);
				ctx.stroke();
			};
			const paddingBlock = videoType === "short" ? 250 : 50;
			const highNegative = videoType === "short" ? -6000 : -4200;
			const a = interpolate(
				time,
				[8, 9 + 1 / 3],
				[highNegative, paddingBlock],
				clamp,
			);
			const convertPosition = ({ x, y }: { x: number; y: number }) => {
				const xWidth = 780;
				return {
					x: interpolate(
						x,
						[-1, counts.get(y)!],
						[(width - xWidth) / 2, (width + xWidth) / 2],
						clamp,
					),
					y: interpolate(
						y,
						[0, nodes.get("out")!.y],
						[a, height - paddingBlock],
						// clamp,
					),
				};
			};
			const highlightYPart1 = interpolate(
				time % 8,
				[0.5, 7.5],
				[nodes.get("you")!.y, nodes.get("out")!.y],
				clamp,
			);
			const highlightYPart2 = interpolate(
				time % 8,
				[
					8 / 6,
					18 / 6, // 17 / 6,
					36 / 6, // 36 / 6,
					46 / 6,
				],
				[
					0,
					nodes.get("fft")!.y,
					// nodes.get("fft")!.y,
					// nodes.get("dac")!.y,
					nodes.get("dac")!.y,
					nodes.get("out")!.y,
				],
				clamp,
			);
			const isPart1 = time < 8;
			const highlightY = isPart1 ? highlightYPart1 : highlightYPart2;
			const highlightedNodes = isPart1 ? part1Nodes : part2Nodes;
			const specialNodes =
				isPart1 ? ["you", "out"] : ["svr", "fft", "dac", "out"];
			const isNodeHighlighted = (key: string) => {
				if (specialNodes.includes(key)) {
					return true;
				}
				return (
					highlightedNodes.has(key) && nodes.get(key)!.y <= highlightY
				);
			};
			const edgeHighlight = (from: string, to: string) => {
				const fromY = nodes.get(from)!.y;
				const toY = nodes.get(to)!.y;
				if (highlightedNodes.has(from) && highlightedNodes.has(to)) {
					return interpolate(highlightY, [fromY, toY], [0, 1], clamp);
				} else {
					return 0;
				}
			};
			for (const [from, neighbors] of graph) {
				for (const to of neighbors) {
					const fromPos = convertPosition(nodes.get(from)!);
					const toPos = convertPosition(nodes.get(to)!);
					drawEdge(fromPos, toPos, false, edgeHighlight(from, to), 1);
				}
			}
			for (const [key, pos] of nodes) {
				if (!isNodeHighlighted(key)) {
					drawNode(
						convertPosition(pos),
						specialNodes.includes(key),
						false,
					);
				}
			}
			for (const [from, neighbors] of graph) {
				for (const to of neighbors) {
					const fromPos = convertPosition(nodes.get(from)!);
					const toPos = convertPosition(nodes.get(to)!);
					drawEdge(fromPos, toPos, true, 0, edgeHighlight(from, to));
				}
			}
			for (const [key, pos] of nodes) {
				if (isNodeHighlighted(key)) {
					drawNode(
						convertPosition(pos),
						specialNodes.includes(key),
						true,
					);
				}
			}
		},
		[time, width, height, nodes, counts, part1Nodes, part2Nodes],
	);

	return (
		<DayWrapper videoType={videoType} day={11} title="Reactor">
			<Canvas draw={draw} />
		</DayWrapper>
	);
};
