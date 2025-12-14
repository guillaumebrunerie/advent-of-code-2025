import { useCallback, useEffect, useMemo } from "react";
import { AbsoluteFill, interpolate, random, useVideoConfig } from "remotion";

import { DayProps, DayWrapper, VideoType } from "../Shorts/DayWrapper";
import { Canvas } from "../common/Canvas";
import { Point } from "../common/Point";
import { Translate } from "../common/Translate";
import { range } from "../common/range";
import { shuffle } from "../common/shuffle";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp } from "../constants";
import { raw } from "./raw";

const solve = () => {
	const data = raw.split("\n\n").at(-1)!;
	const sizes = data
		.trim()
		.split("\n")
		.map((line) => {
			const [a, b] = line.split(": ");
			const [width, height] = a.split("x").map(Number);
			const shapeCounts = b.split(" ").map(Number);
			return { width, height, shapeCounts };
		});
	const shapeSizes = [7, 7, 7, 5, 6, 7];
	const rotate = (form: string[][]) => {
		const newForm: string[][] = [];
		for (let x = 0; x < 3; x++) {
			const newRow: string[] = [];
			for (let y = 0; y < 3; y++) {
				newRow.push(form[y][2 - x]);
			}
			newForm.push(newRow);
		}
		return newForm;
	};
	const flip = (form: string[][]) => {
		const newForm: string[][] = [];
		for (let x = 0; x < 3; x++) {
			const newRow: string[] = [];
			for (let y = 0; y < 3; y++) {
				newRow.push(form[2 - x][y]);
			}
			newForm.push(newRow);
		}
		return newForm;
	};
	const shapeForms = raw
		.trim()
		.split("\n\n")
		.slice(0, -1)
		.map((block) =>
			block
				.split("\n")
				.slice(1)
				.map((line) => line.split("")),
		)
		.map((s) => [
			s,
			rotate(s),
			rotate(rotate(s)),
			rotate(rotate(rotate(s))),
			flip(s),
			rotate(flip(s)),
			rotate(rotate(flip(s))),
			rotate(rotate(rotate(flip(s)))),
		]);

	let count = 0;
	for (const { width, height, shapeCounts } of sizes) {
		let areaUsed = 0;
		let shapes = 0;
		shapeCounts.forEach((count, i) => {
			areaUsed += count * shapeSizes[i];
			shapes += count;
		});
		const totalArea = width * height;
		if (totalArea < areaUsed) {
			continue;
		}

		const a = Math.floor(width / 3);
		const b = Math.floor(height / 3);
		const slots = a * b;
		if (shapes <= slots) {
			count++;
			continue;
		}
		console.log("Unknown", width, height, shapeCounts);
	}

	const shapesByLine: {
		width: number;
		height: number;
		shapes: {
			shape: string[][];
			x: number;
			y: number;
			color: string;
			badColor: string;
		}[];
		badIndex: number;
	}[] = [];
	sizes.forEach(({ width, height, shapeCounts }, i) => {
		const shapes: string[][][] = [];
		shapeCounts.forEach((count, i) => {
			for (let j = 0; j < count; j++) {
				shapes.push(
					shapeForms[i][
						Math.floor(random(`${i}-${j}`) * shapeForms[i].length)
					],
				);
			}
		});
		const shapesShuffled = shuffle(shapes, `${i}`);
		const grid = range(0, 2 * height - 1).map(() =>
			range(0, width - 1).map(() => false),
		);
		let colorI = 0;
		const shapesWithPositions = shapesShuffled.map((shape, i) => {
			let x = 0;
			let y = 0;
			let canPlace = false;
			outer: for (y = 0; y < 2 * height - 2; y++) {
				for (x = 0; x < width - 2; x++) {
					canPlace = true;
					inner: for (let dx = 0; dx < 3; dx++) {
						for (let dy = 0; dy < 3; dy++) {
							if (shape[dy][dx] === "#" && grid[y + dy][x + dx]) {
								canPlace = false;
								break inner;
							}
						}
					}
					if (canPlace) {
						break outer;
					}
				}
			}
			for (let dx = 0; dx < 3; dx++) {
				for (let dy = 0; dy < 3; dy++) {
					if (shape[dy][dx] === "#") {
						grid[y + dy][x + dx] = true;
					}
				}
			}
			return {
				shape,
				x,
				y,
				color: ["#0C0", "#CC0", "#0CC"][colorI++ % 3],
				badColor: ["#C00", "#C08", "#C80"][colorI % 3],
			};
		});
		const badIndex = shapesWithPositions.findIndex(
			({ y }) => y >= height - 2,
		);
		shapesByLine.push({
			width,
			height,
			shapes: shapesWithPositions,
			badIndex,
		});
	});

	console.log("Part 1:", count);

	return { shapesByLine };
};

const Star = ({ pos, r }: { pos: Point; r: number }) => {
	return (
		<Translate dx={pos.x} dy={pos.y}>
			<span
				style={{
					color: "yellow",
					fontWeight: "bold",
					fontSize: 42,
					transform: `rotate(${r}deg)`,
					width: "fit-content",
					textShadow: "0 0 15px yellow",
				}}
			>
				*
			</span>
		</Translate>
	);
};

const makeStars = (videoType: VideoType, width: number, height: number) =>
	Array(24)
		.fill(true)
		.map((_, i) => {
			const tMax = 2;
			const yMax = videoType == "short" ? 100 : 0;
			const initialY = height + 150;
			const speed = ((initialY - yMax) * 4) / tMax;
			const gravity = (2 * speed) / tMax;
			const angle = (random(`anglex${i}`) - 0.5) * 2 * 15;
			const v =
				speed *
				(1 +
					(random(`x${i}`) - 0.5) *
						(videoType == "short" ? 0.05 : 0.1));
			const vx = v * Math.sin((angle * Math.PI) / 180);
			const vy = v * Math.cos((angle * Math.PI) / 180);
			const vr = (random(`vr${i}`) - 0.5) * 720;
			return {
				initialX: width / 2 + (random(`x${i}`) - 0.5) * 400,
				initialY,
				vx,
				vy,
				vr,
				gravity,
			};
		});

export const Day12 = ({ videoType }: DayProps) => {
	const { shapesByLine } = useMemo(solve, []);
	const time = useCurrentTime();
	const { width, height } = useVideoConfig();
	const isPart1 = time < 8;
	const stars = useMemo(
		() => makeStars(videoType, width, height),
		[videoType, width, height],
	);

	const initialIndex = 12;

	useEffect(() => {
		let audio1 = "";
		for (const line of shapesByLine.slice(initialIndex, initialIndex + 8)) {
			const maxY = Math.max(...line.shapes.map(({ y }) => y));
			audio1 += `~ [${range(0, Math.floor(maxY / 3)).join(" ")}]@10 ${line.badIndex == -1 ? "20" : "6"}@5\n`;
		}
		console.log(
			`$: n(\`\n${audio1}\`).slow("8").scale("c3:minor").sound("triangle")`,
		);
		console.log(
			`$: s("<${range(0, 23)
				.map(
					(i) =>
						`sleighbells:${[1, 3, 4, 6][Math.floor(random("bell-" + i) * 4)]}`,
				)
				.join(" ")}>").fast(4)`,
		);
	}, [shapesByLine, initialIndex]);

	const tileSize = 15;
	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			const i = Math.floor(time) + initialIndex;
			const {
				width: tilesX,
				height: tilesY,
				shapes,
				badIndex,
			} = shapesByLine[i];
			const totalWidth = tilesX * tileSize;
			const totalHeight = tilesY * tileSize;
			const convertPosition = (x: number, y: number) => {
				return {
					x: Math.floor(
						interpolate(
							x,
							[0, tilesX],
							[
								(width - totalWidth) / 2,
								(width + totalWidth) / 2,
							],
						),
					),
					y: Math.floor(
						interpolate(
							y,
							[0, tilesY],
							[
								(height + totalHeight) / 2,
								(height - totalHeight) / 2,
							],
						),
					),
				};
			};
			const index = Math.floor(
				interpolate(
					time % 1,
					[0.125, 0.875],
					[0, shapes.length],
					clamp,
				),
			);
			for (const { shape, x, y, color, badColor } of shapes.slice(
				0,
				index,
			)) {
				for (let dy = 0; dy < 3; dy++) {
					for (let dx = 0; dx < 3; dx++) {
						if (shape[dy][dx] === ".") {
							continue;
						}
						ctx.fillStyle =
							badIndex >= 0 && index >= badIndex ?
								badColor
							:	color;
						const pos = convertPosition(x + dx, y + dy);
						ctx.fillRect(pos.x, pos.y, tileSize, tileSize);
					}
				}
				ctx.lineCap = "square";
				ctx.strokeStyle = "#FFF";
				ctx.lineWidth = 2;
				for (let dy = 0; dy < 3; dy++) {
					for (let dx = 0; dx < 3; dx++) {
						if (shape[dy][dx] === ".") {
							continue;
						}
						const pos = convertPosition(x + dx, y + dy);

						if (dx == 0 || shape[dy][dx - 1] === ".") {
							ctx.beginPath();
							ctx.moveTo(pos.x, pos.y);
							ctx.lineTo(pos.x, pos.y + tileSize);
							ctx.stroke();
						}
						if (dx == 2 || shape[dy][dx + 1] === ".") {
							ctx.beginPath();
							ctx.moveTo(pos.x + tileSize, pos.y);
							ctx.lineTo(pos.x + tileSize, pos.y + tileSize);
							ctx.stroke();
						}
						if (dy == 0 || shape[dy - 1][dx] === ".") {
							ctx.beginPath();
							ctx.moveTo(pos.x, pos.y + tileSize);
							ctx.lineTo(pos.x + tileSize, pos.y + tileSize);
							ctx.stroke();
						}
						if (dy == 2 || shape[dy + 1][dx] === ".") {
							ctx.beginPath();
							ctx.moveTo(pos.x, pos.y);
							ctx.lineTo(pos.x + tileSize, pos.y);
							ctx.stroke();
						}
					}
				}
			}
			ctx.strokeStyle = "#FFF";
			ctx.lineWidth = 5;
			const topLeft = convertPosition(0, tilesY - 1);
			ctx.strokeRect(topLeft.x, topLeft.y, totalWidth, totalHeight);
		},
		[time, width, height, shapesByLine],
	);

	const fadeOut = interpolate(time % 8, [6.5, 7.5], [1, 0], clamp);
	const opacity = fadeOut;

	return (
		<DayWrapper videoType={videoType} day={12} title="Christmas Tree Farm">
			{isPart1 && <Canvas draw={draw} />}
			{!isPart1 &&
				stars.map((star, i) => {
					const t =
						time -
						8 -
						interpolate(i, [0, stars.length], [0.25, 6.25], clamp);
					if (t < 0) {
						return null;
					}
					const x = star.initialX + star.vx * t;
					const y =
						star.initialY -
						star.vy * t +
						(star.gravity * t * t) / 2;
					const r = t * star.vr;
					return <Star pos={{ x, y }} r={r} key={i} />;
				})}
			{!isPart1 && (
				<div>
					<AbsoluteFill
						style={{
							color: "#ffffff",
							textShadow: "0 0 10px #ffffff",
							fontSize: 80,
							fontWeight: 300,
							display: "grid",
							alignItems: "center",
							justifyItems: "center",
							padding: "200px 0",
							width: "100%",
							textAlign: "center",
							opacity,
						}}
					>
						Thank you for watching!
					</AbsoluteFill>
				</div>
			)}
		</DayWrapper>
	);
};
