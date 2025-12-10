import { useCallback, useEffect, useMemo } from "react";
import { interpolate, useVideoConfig } from "remotion";

import { DayProps, DayWrapper } from "../Shorts/DayWrapper";
import { Canvas } from "../common/Canvas";
import { range } from "../common/range";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp } from "../constants";
import { raw } from "./raw";

// const raw = `
// [.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
// [...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
// [.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}
// `;

const solve = () => {
	const lines = raw
		.trim()
		.split("\n")
		.map((line) => {
			const firstBracket = line.indexOf("]");
			const secondBracket = line.indexOf("{", firstBracket);
			const pattern = line
				.slice(1, firstBracket)
				.split("")
				.map((c) => c === "#");
			const buttons = line
				.slice(firstBracket + 3, secondBracket - 2)
				.split(") (")
				.map((s) => s.split(",").map(Number));
			const joltages = line
				.slice(secondBracket + 1, line.length - 1)
				.split(",")
				.map(Number);
			return { pattern, buttons, joltages };
		});

	const solve = (
		pattern: boolean[],
		buttons: number[][],
		presses: number,
	): number => {
		if (pattern.every((c) => !c)) {
			return presses;
		}
		if (buttons.length == 0) {
			return Infinity;
		}
		const noPress = solve(pattern, buttons.slice(1), presses);
		const press = solve(
			pattern.map((c, i) => {
				if (buttons[0].includes(i)) {
					return !c;
				} else {
					return c;
				}
			}),
			buttons.slice(1),
			presses + 1,
		);
		return Math.min(noPress, press);
	};

	console.log(
		"Part 1:",
		lines
			.map(({ pattern, buttons }) => solve(pattern, buttons, 0))
			.reduce((a, b) => a + b, 0),
	);

	console.log("Start");
	let totalSum = 0;
	for (const { pattern, buttons, joltages } of lines) {
		// console.log(
		// 	"New Line: ",
		// 	pattern.map((c) => (c ? "#" : ".")).join(""),
		// 	buttons,
		// 	joltages,
		// );
		let matrix = joltages.map((joltage, i) => {
			return [...buttons.map((b) => (b.includes(i) ? 1 : 0)), joltage];
		});
		const printMatrix = () => {
			console.log(matrix.map((row) => row.join(",")).join("\n"));
		};
		// printMatrix();
		const isZero = (x: number) => Math.abs(x) < 0.00001;
		const isPositiveInteger = (x: number) =>
			x > -0.00001 && Math.abs(x - Math.round(x)) < 0.00001;
		for (let i = 0; i < matrix.length; i++) {
			if (isZero(matrix[i][i])) {
				// Try swapping rows
				for (let j = i + 1; j < matrix.length; j++) {
					if (!isZero(matrix[j][i])) {
						[matrix[i], matrix[j]] = [matrix[j], matrix[i]];
						// console.log("Swapped rows", i, j);
						// printMatrix();
						break;
					}
				}
			}
			if (isZero(matrix[i][i])) {
				// Try swapping columns
				for (let j = i + 1; j < matrix[i].length - 1; j++) {
					if (!isZero(matrix[i][j])) {
						matrix = matrix.map((row) => row.slice());
						for (let k = 0; k < matrix.length; k++) {
							[matrix[k][i], matrix[k][j]] = [
								matrix[k][j],
								matrix[k][i],
							];
						}
						// console.log("Swapped columns", i, j);
						// printMatrix();
						break;
					}
				}
			}
			if (isZero(matrix[i][i])) {
				// Delete row
				matrix = [...matrix.slice(0, i), ...matrix.slice(i + 1)];
				// console.log("Deleted row", i);
				// printMatrix();
				i--;
				continue;
			}
			const factor = matrix[i][i];
			for (let j = 0; j < matrix[i].length; j++) {
				matrix[i][j] /= factor;
			}
			for (let i2 = 0; i2 < matrix.length; i2++) {
				if (i2 == i) {
					continue;
				}
				const factor = matrix[i2][i];
				for (let j = 0; j < matrix[i2].length; j++) {
					matrix[i2][j] -= factor * matrix[i][j];
				}
			}
		}
		// printMatrix();
		const freeVariables = matrix[0].length - matrix.length - 1;
		console.log("Free variables:", freeVariables);
		if (freeVariables < 0) {
			debugger;
		}
		const attempt = range(0, freeVariables - 1).map(() => 0);
		const tryAttempt = (attempt: number[]) => {
			const presses = matrix.map((line, i) => {
				let presses = line[line.length - 1];
				attempt.forEach((v, j) => {
					presses -= v * line[matrix.length + j];
				});
				return presses;
			});
			if (presses.some((p) => !isPositiveInteger(p))) {
				return Infinity;
			}
			return [...presses, ...attempt].reduce(
				(a, b) => a + Math.round(b),
				0,
			);
		};

		let best: number = Infinity;
		switch (freeVariables) {
			case 0: {
				best = tryAttempt([]);
				break;
			}
			case 1: {
				let x = 0;
				while (true) {
					const res = tryAttempt([x]);
					if (res < best) {
						best = res;
					}
					x++;
					if (x > best) {
						break;
					}
					if (x > 1000) {
						throw new Error("Too many attempts");
					}
				}
				break;
			}
			case 2: {
				let sum = 0;
				while (true) {
					for (let x = 0; x <= sum; x++) {
						const y = sum - x;
						const res = tryAttempt([x, y]);
						if (res < best) {
							best = res;
						}
					}
					sum++;
					if (sum > best) {
						break;
					}
					if (sum > 1000) {
						throw new Error("Too many attempts");
					}
				}
				break;
			}
			case 3: {
				let sum = 0;
				while (true) {
					for (let x = 0; x <= sum; x++) {
						for (let y = 0; y <= sum - x; y++) {
							const z = sum - x - y;
							const res = tryAttempt([x, y, z]);
							if (res < best) {
								best = res;
							}
						}
					}
					sum++;
					if (sum > best) {
						break;
					}
					if (sum > 1000) {
						throw new Error("Too many attempts");
					}
				}
				break;
			}
		}
		totalSum += best;
		console.log(best);
	}
	console.log("Part 2:", totalSum);
};

export const Day10 = ({ videoType }: DayProps) => {
	const data = useMemo(solve, []);
	const time = useCurrentTime();
	const { width, height } = useVideoConfig();

	const draw = useCallback((ctx: CanvasRenderingContext2D) => {}, []);

	return (
		<DayWrapper videoType={videoType} day={10} title="Factory">
			<Canvas draw={draw} />
		</DayWrapper>
	);
};
