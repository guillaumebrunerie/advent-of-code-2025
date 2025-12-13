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

	const nodes = new Map<string, { x: number; y: number }>();
	const counts = new Map<number, number>();
	const processNodes = (node: string, y: number) => {
		if (nodes.has(node)) {
			return;
		}
		const x = counts.get(y) || 0;
		nodes.set(node, { x, y });
		counts.set(y, x + 1);
		for (const neighbor of graph.get(node) || []) {
			processNodes(neighbor, y + 1);
		}
	};
	processNodes("svr", 0);

	console.log("Part 1:", countPaths("svr", "out"));
	return { graph, nodes, counts };
};

export const Day11 = ({ videoType }: DayProps) => {
	const { graph, nodes, counts } = useMemo(solve, []);
	const time = useCurrentTime();
	const { width, height } = useVideoConfig();

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			const nodeRadius = 10;
			const drawNode = (
				{ x, y }: { x: number; y: number },
				special: boolean,
			) => {
				ctx.strokeStyle = "#CCC";
				ctx.fillStyle = special ? "#0F0" : "#CCC";
				ctx.lineWidth = 0;
				ctx.beginPath();
				ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
				ctx.fill();
				// ctx.stroke();
			};
			const drawEdge = (
				from: { x: number; y: number },
				to: { x: number; y: number },
			) => {
				ctx.strokeStyle = "#888";
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(from.x, from.y);
				ctx.lineTo(to.x, to.y);
				ctx.stroke();
			};
			const convertPosition = ({ x, y }: { x: number; y: number }) => {
				return {
					x: interpolate(
						x,
						[-1, counts.get(y)!],
						[150, width - 150],
						clamp,
					),
					y: interpolate(y, [0, 35], [150, height - 150], clamp),
				};
			};
			for (const [from, neighbors] of graph) {
				for (const to of neighbors) {
					const fromPos = convertPosition(nodes.get(from)!);
					const toPos = convertPosition(nodes.get(to)!);
					drawEdge(fromPos, toPos);
				}
			}
			for (const [key, pos] of nodes) {
				drawNode(
					convertPosition(pos),
					["svr", "you", "out", "fft", "dac"].includes(key),
				);
			}
		},
		[time, width, height, nodes, counts],
	);

	return (
		<DayWrapper videoType={videoType} day={11} title="Reactor">
			<Canvas draw={draw} />
		</DayWrapper>
	);
};
