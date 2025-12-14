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
		presses: number[] = [],
		i: number = 0,
	): number[] | undefined => {
		if (pattern.every((c) => !c)) {
			return presses;
		}
		if (buttons.length == 0) {
			return;
		}
		const noPress = solve(pattern, buttons.slice(1), presses, i + 1);
		const press = solve(
			pattern.map((c, i) => {
				if (buttons[0].includes(i)) {
					return !c;
				} else {
					return c;
				}
			}),
			buttons.slice(1),
			[...presses, i],
			i + 1,
		);
		if (noPress === undefined && press === undefined) {
			return undefined;
		} else if (noPress === undefined) {
			return press;
		} else if (press === undefined) {
			return noPress;
		} else if (noPress.length < press.length) {
			return noPress;
		} else {
			return press;
		}
	};

	const part1 = lines.map(({ pattern, buttons }) => solve(pattern, buttons)!);

	// console.log(
	// 	"Part 1:",
	// 	part1.reduce((a, b) => a + b, 0),
	// );

	let totalSum = 0;
	const part2: number[][] = [];
	for (const { pattern, buttons, joltages } of lines) {
		let matrix = joltages.map((joltage, i) => {
			return [...buttons.map((b) => (b.includes(i) ? 1 : 0)), joltage];
		});
		// const printMatrix = () => {
		// 	console.log(matrix.map((row) => row.join(",")).join("\n"));
		// };
		// printMatrix();
		const isZero = (x: number) => Math.abs(x) < 0.00001;
		const isPositiveInteger = (x: number) =>
			x > -0.00001 && Math.abs(x - Math.round(x)) < 0.00001;
		type Operation =
			| {
					type: "swappedRows";
					i: number;
					j: number;
			  }
			| {
					type: "swappedColumns";
					i: number;
					j: number;
			  }
			| {
					type: "deletedRow";
					i: number;
			  };
		const operations: Operation[] = [];
		for (let i = 0; i < matrix.length; i++) {
			if (isZero(matrix[i][i])) {
				// Try swapping rows
				for (let j = i + 1; j < matrix.length; j++) {
					if (!isZero(matrix[j][i])) {
						[matrix[i], matrix[j]] = [matrix[j], matrix[i]];
						operations.push({ type: "swappedRows", i, j });
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
						operations.push({ type: "swappedColumns", i, j });
						// console.log("Swapped columns", i, j);
						// printMatrix();
						break;
					}
				}
			}
			if (isZero(matrix[i][i])) {
				// Delete row
				matrix = [...matrix.slice(0, i), ...matrix.slice(i + 1)];
				operations.push({ type: "deletedRow", i });
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
		// console.log("Free variables:", freeVariables);
		if (freeVariables < 0) {
			debugger;
		}
		const tryAttempt = (attempt: number[]) => {
			const presses = matrix.map((line, _) => {
				let presses = line[line.length - 1];
				attempt.forEach((v, j) => {
					presses -= v * line[matrix.length + j];
				});
				return presses;
			});
			if (presses.some((p) => !isPositiveInteger(p))) {
				return [Infinity];
			}
			return [...presses, ...attempt].map((x) => Math.round(x));
		};

		let bestAttempt: number[] = [];
		let best: number = Infinity;
		switch (freeVariables) {
			case 0: {
				bestAttempt = tryAttempt([]);
				best = bestAttempt.reduce((a, b) => a + b, 0);
				break;
			}
			case 1: {
				let x = 0;
				while (true) {
					const res = tryAttempt([x]);
					const resSum = res.reduce((a, b) => a + b, 0);
					if (resSum < best) {
						bestAttempt = res;
						best = resSum;
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
						const resSum = res.reduce((a, b) => a + b, 0);
						if (resSum < best) {
							bestAttempt = res;
							best = resSum;
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
							const resSum = res.reduce((a, b) => a + b, 0);
							if (resSum < best) {
								bestAttempt = res;
								best = resSum;
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
		part2.push(bestAttempt);

		for (const op of operations.reverse()) {
			switch (op.type) {
				case "swappedColumns": {
					const { i, j } = op;
					[bestAttempt[i], bestAttempt[j]] = [
						bestAttempt[j],
						bestAttempt[i],
					];
				}
			}
		}

		const joltagesCurrent = joltages.map(() => 0);
		buttons.forEach((button, index) => {
			button.forEach((lightIndex) => {
				joltagesCurrent[lightIndex] += bestAttempt[index];
			});
		});

		if (joltagesCurrent.some((joltage, i) => joltage != joltages[i])) {
			debugger;
		}

		totalSum += best;
		// console.log(best);
	}
	// console.log("Part 2:", totalSum);
	return { lines, part1, part2 };
};

export const Day10 = ({ videoType }: DayProps) => {
	const { lines, part1, part2 } = useMemo(solve, []);
	const time = useCurrentTime();
	const { width, height } = useVideoConfig();

	// const validFirstIndices = lines.flatMap((_, i) => {
	// 	let n = 0;
	// 	for (let j = i; j < lines.length; j++) {
	// 		n += lines[j].buttons.length + 1;
	// 		if (n > 32) {
	// 			return [];
	// 		} else if (n == 32 && j > i + 3) {
	// 			return i;
	// 		}
	// 	}
	// });
	// console.log(validFirstIndices);

	const firstIndexPart1 = 24;
	const firstIndexPart2 = 105; //46;

	// useEffect(() => {
	// 	let part1Audio = "";
	// 	let index = firstIndexPart1;
	// 	let t = 0;
	// 	while (t < 32) {
	// 		part1Audio += " 0";
	// 		const { pattern, buttons } = lines[index];
	// 		const solution = part1[index];
	// 		const litLights = pattern.map(() => false);
	// 		solution.forEach((b) => {
	// 			buttons[b].forEach((lightIndex) => {
	// 				litLights[lightIndex] = !litLights[lightIndex];
	// 			});
	// 			part1Audio += ` [${litLights.flatMap((b, i) => (b ? `${i + 5}` : [])).join(", ")}]`;
	// 		});
	// 		part1Audio += "@2\n";
	// 		t += solution.length + 2;
	// 		index++;
	// 	}
	// 	console.log(
	// 		`$: n(\`<\n${part1Audio}>\`).fast(4).sound("sine").scale("c2:minor:pentatonic").attack("0.05").gain("0.5")`,
	// 	);
	// }, [firstIndexPart1, firstIndexPart2, lines, part1, part2]);

	useEffect(() => {
		let part2Audio = "";
		let index = firstIndexPart2;
		let t = 0;
		while (t < 32) {
			part2Audio += '"0", ';
			const { buttons, joltages } = lines[index];
			const solution = part2[index];
			const joltagesCurrent = joltages.map(() => 0);
			solution.forEach((sol, k) => {
				buttons[k].forEach((lightIndex) => {
					joltagesCurrent[lightIndex] += sol;
				});

				const maxJoltage = Math.max(...joltages);
				const joltageYFactor =
					interpolate(maxJoltage, [0, 300], [250, 500], clamp) /
					maxJoltage;

				const notes = joltagesCurrent
					.map((j, i) => {
						return `n("${i + 5}").gain("${((j * joltageYFactor) / 425).toFixed(2)}")`;
					})
					.join(", ");
				const stack = `stack(${notes})`;
				part2Audio +=
					k == solution.length - 1 ?
						`[2, ${stack}], \n`
					:	`${stack}, `;
			});
			t += solution.length + 1;
			index++;
		}
		console.log(
			`$: stepcat(\n${part2Audio}).slow(8).sound("sine").scale("c2:major:pentatonic").attack("0.05").velocity("0 1".slow(16))`,
		);
	}, [firstIndexPart1, firstIndexPart2, lines, part1, part2]);

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			const isPart1 = time < 8;
			let n = Math.floor((time % 8) * 4);
			let pressedButtons = 0;
			let pressedButton = 0;
			let isWaiting = false;
			let i = isPart1 ? firstIndexPart1 : firstIndexPart2;
			time;
			if (isPart1) {
				for (; i < lines.length; i++) {
					if (n < part1[i].length + 2) {
						pressedButtons = Math.min(n, part1[i].length);
						break;
					} else {
						n -= part1[i].length + 2;
					}
				}
			} else {
				for (; i < lines.length; i++) {
					if (n < part2[i].length + 1) {
						pressedButton = Math.min(n, part2[i].length - 1);
						if (n >= part2[i].length) {
							isWaiting = true;
						}
						break;
					} else {
						n -= part2[i].length + 1;
					}
				}
			}

			const { pattern, buttons, joltages } = lines[i];
			const solution = part1[i];
			const litLights = pattern.map(() => false);
			for (let k = 0; k < pressedButtons; k++) {
				buttons[solution[k]].forEach((lightIndex) => {
					litLights[lightIndex] = !litLights[lightIndex];
				});
			}

			const joltagesCurrent = joltages.map(() => 0);
			buttons.forEach((button, index) => {
				if (index < pressedButton) {
					button.forEach((lightIndex) => {
						joltagesCurrent[lightIndex] += part2[i][index];
					});
				} else if (index == pressedButton) {
					const alpha = isWaiting ? 1 : (time * 4) % 1;
					button.forEach((lightIndex) => {
						joltagesCurrent[lightIndex] += alpha * part2[i][index];
					});
				}
			});
			// console.log(buttons, joltages, part2[i]);

			const lightRadius = 25;
			const drawLight = (
				x: number,
				y: number,
				toBeLit: boolean,
				lit: boolean,
			) => {
				ctx.strokeStyle = "#CCC";
				ctx.fillStyle =
					lit ?
						toBeLit ? "#080"
						:	"#040"
					:	"transparent";
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				ctx.lineWidth = 8;
				ctx.beginPath();
				ctx.arc(x, y, lightRadius, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				const y1 = 140;
				const y2 = 60;
				const d = 20;
				if (toBeLit) {
					ctx.strokeStyle = lit ? "#080" : "#CCC";
					ctx.moveTo(x, y - y1);
					ctx.lineTo(x, y - y2);
					ctx.lineTo(x + d, y - y2 - d);
					ctx.moveTo(x, y - y2);
					ctx.lineTo(x - d, y - y2 - d);
					ctx.stroke();
				}
			};
			const patternWidth = 250 + pattern.length * 40;
			const patternX = (i: number) =>
				(width - patternWidth) / 2 +
				i * (patternWidth / (pattern.length - 1));
			const patternY = videoType == "short" ? height / 3 : height / 3;
			const drawPattern = () => {
				pattern.forEach((c, i) => {
					drawLight(patternX(i), patternY, c, litLights[i]);
				});
			};
			const joltageWidth = 30;
			const maxJoltage = Math.max(...joltages);
			const joltageYFactor =
				interpolate(
					maxJoltage,
					[0, 300],
					[250, videoType == "short" ? 500 : 400],
					clamp,
				) / maxJoltage;
			const drawJoltage = (
				x: number,
				y: number,
				total: number,
				current: number,
			) => {
				ctx.fillStyle = "#080";
				ctx.fillRect(
					x - joltageWidth / 2,
					y + lightRadius - joltageYFactor * current,
					joltageWidth,
					joltageYFactor * current,
				);
				ctx.strokeStyle = "#CCC";
				ctx.beginPath();
				ctx.moveTo(x - joltageWidth / 2, y + lightRadius);
				ctx.lineTo(x + joltageWidth / 2, y + lightRadius);
				// ctx.stroke();
				// ctx.beginPath();
				ctx.lineTo(
					x + joltageWidth / 2,
					y + lightRadius - joltageYFactor * total,
				);
				ctx.lineTo(
					x - joltageWidth / 2,
					y + lightRadius - joltageYFactor * total,
				);
				ctx.lineTo(x - joltageWidth / 2, y + lightRadius);
				ctx.stroke();
			};
			const drawJoltages = () => {
				joltages.forEach((c, i) => {
					drawJoltage(patternX(i), patternY, c, joltagesCurrent[i]);
				});
			};
			const drawButton = (x: number, y: number, pressed: boolean) => {
				const buttonSize = 30;
				ctx.fillStyle = pressed ? "#0C0" : "#CCC";
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				ctx.lineWidth = 10;
				ctx.fillRect(
					x - buttonSize / 2,
					y - buttonSize / 2,
					buttonSize,
					buttonSize,
				);
			};
			const buttonsWidth = 250 + buttons.length * 40;
			const buttonX = (i: number) =>
				(width - buttonsWidth) / 2 +
				i * (buttonsWidth / (buttons.length - 1));
			const buttonY =
				videoType == "short" ? (height / 3) * 2 : (height / 4) * 3;
			const isButtonPressed = (i: number) =>
				isPart1 ?
					solution.slice(0, pressedButtons).includes(i)
				:	i == pressedButton;
			const drawButtons = () => {
				buttons.forEach((_, i) => {
					drawButton(buttonX(i), buttonY, isButtonPressed(i));
				});
			};
			const drawConnection = (
				buttonIndex: number,
				lightIndex: number,
				active: boolean,
			) => {
				ctx.strokeStyle = active ? "#0C0" : "#CCC";
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				ctx.lineWidth = 8;
				ctx.beginPath();
				ctx.moveTo(buttonX(buttonIndex), buttonY);
				ctx.bezierCurveTo(
					buttonX(buttonIndex),
					buttonY - 200,
					patternX(lightIndex),
					patternY + 200,
					patternX(lightIndex),
					patternY + lightRadius,
				);
				ctx.stroke();
			};
			const drawInactiveConnections = () => {
				buttons.forEach((button, i) => {
					button.forEach((lightIndex) => {
						if (!isButtonPressed(i)) {
							drawConnection(i, lightIndex, false);
						}
					});
				});
			};
			const drawActiveConnections = () => {
				buttons.forEach((button, i) => {
					button.forEach((lightIndex) => {
						if (isButtonPressed(i)) {
							drawConnection(i, lightIndex, true);
						}
					});
				});
			};
			drawButtons();
			drawInactiveConnections();
			drawActiveConnections();
			if (isPart1) {
				drawPattern();
			} else {
				drawJoltages();
			}
		},
		[part1, time, width, height],
	);

	return (
		<DayWrapper videoType={videoType} day={10} title="Factory">
			<Canvas draw={draw} />
		</DayWrapper>
	);
};

/**

setcps(1)

$: s("lt").gain("<0 0.5>").slow(8)

$: stepcat(
"0", stack(n("5").gain("0.00"), n("6").gain("0.12"), n("7").gain("0.00"), n("8").gain("0.00"), n("9").gain("0.12"), n("10").gain("0.00"), n("11").gain("0.00"), n("12").gain("0.00"), n("13").gain("0.00"), n("14").gain("0.12")), stack(n("5").gain("0.68"), n("6").gain("0.12"), n("7").gain("0.68"), n("8").gain("0.00"), n("9").gain("0.12"), n("10").gain("0.00"), n("11").gain("0.00"), n("12").gain("0.00"), n("13").gain("0.68"), n("14").gain("0.12")), stack(n("5").gain("0.68"), n("6").gain("0.12"), n("7").gain("0.68"), n("8").gain("0.00"), n("9").gain("0.14"), n("10").gain("0.02"), n("11").gain("0.00"), n("12").gain("0.02"), n("13").gain("0.68"), n("14").gain("0.12")), stack(n("5").gain("0.68"), n("6").gain("0.12"), n("7").gain("0.68"), n("8").gain("0.00"), n("9").gain("0.14"), n("10").gain("0.02"), n("11").gain("0.00"), n("12").gain("0.02"), n("13").gain("0.68"), n("14").gain("0.12")), stack(n("5").gain("0.74"), n("6").gain("0.12"), n("7").gain("0.74"), n("8").gain("0.00"), n("9").gain("0.14"), n("10").gain("0.02"), n("11").gain("0.06"), n("12").gain("0.08"), n("13").gain("0.74"), n("14").gain("0.12")), stack(n("5").gain("0.74"), n("6").gain("0.21"), n("7").gain("0.83"), n("8").gain("0.08"), n("9").gain("0.23"), n("10").gain("0.10"), n("11").gain("0.14"), n("12").gain("0.16"), n("13").gain("0.74"), n("14").gain("0.21")), stack(n("5").gain("0.74"), n("6").gain("0.22"), n("7").gain("0.84"), n("8").gain("0.08"), n("9").gain("0.24"), n("10").gain("0.10"), n("11").gain("0.16"), n("12").gain("0.18"), n("13").gain("0.76"), n("14").gain("0.22")), [2, stack(n("5").gain("0.74"), n("6").gain("0.22"), n("7").gain("0.84"), n("8").gain("0.08"), n("9").gain("0.31"), n("10").gain("0.10"), n("11").gain("0.16"), n("12").gain("0.18"), n("13").gain("0.76"), n("14").gain("0.22"))], 
"0", stack(n("5").gain("0.00"), n("6").gain("0.00"), n("7").gain("0.27"), n("8").gain("0.00")), stack(n("5").gain("0.09"), n("6").gain("0.09"), n("7").gain("0.27"), n("8").gain("0.00")), stack(n("5").gain("0.45"), n("6").gain("0.09"), n("7").gain("0.27"), n("8").gain("0.00")), stack(n("5").gain("0.45"), n("6").gain("0.09"), n("7").gain("0.63"), n("8").gain("0.36")), [2, stack(n("5").gain("0.45"), n("6").gain("0.09"), n("7").gain("0.63"), n("8").gain("0.36"))], 
"0", stack(n("5").gain("0.45"), n("6").gain("0.00"), n("7").gain("0.45"), n("8").gain("0.00")), [2, stack(n("5").gain("0.45"), n("6").gain("0.19"), n("7").gain("0.64"), n("8").gain("0.19"))], 
"0", stack(n("5").gain("0.14"), n("6").gain("0.14"), n("7").gain("0.14"), n("8").gain("0.14"), n("9").gain("0.14"), n("10").gain("0.00"), n("11").gain("0.14"), n("12").gain("0.14")), stack(n("5").gain("0.14"), n("6").gain("0.14"), n("7").gain("0.14"), n("8").gain("0.14"), n("9").gain("0.14"), n("10").gain("0.00"), n("11").gain("0.14"), n("12").gain("0.14")), stack(n("5").gain("0.20"), n("6").gain("0.20"), n("7").gain("0.14"), n("8").gain("0.20"), n("9").gain("0.14"), n("10").gain("0.06"), n("11").gain("0.20"), n("12").gain("0.20")), stack(n("5").gain("0.35"), n("6").gain("0.35"), n("7").gain("0.29"), n("8").gain("0.35"), n("9").gain("0.29"), n("10").gain("0.21"), n("11").gain("0.20"), n("12").gain("0.20")), stack(n("5").gain("0.46"), n("6").gain("0.46"), n("7").gain("0.39"), n("8").gain("0.35"), n("9").gain("0.39"), n("10").gain("0.21"), n("11").gain("0.31"), n("12").gain("0.31")), stack(n("5").gain("0.46"), n("6").gain("0.46"), n("7").gain("0.39"), n("8").gain("0.35"), n("9").gain("0.39"), n("10").gain("0.21"), n("11").gain("0.31"), n("12").gain("0.31")), stack(n("5").gain("0.64"), n("6").gain("0.46"), n("7").gain("0.57"), n("8").gain("0.35"), n("9").gain("0.57"), n("10").gain("0.21"), n("11").gain("0.49"), n("12").gain("0.31")), stack(n("5").gain("0.64"), n("6").gain("0.57"), n("7").gain("0.57"), n("8").gain("0.35"), n("9").gain("0.69"), n("10").gain("0.33"), n("11").gain("0.60"), n("12").gain("0.31")), [2, stack(n("5").gain("0.67"), n("6").gain("0.60"), n("7").gain("0.57"), n("8").gain("0.38"), n("9").gain("0.72"), n("10").gain("0.36"), n("11").gain("0.64"), n("12").gain("0.34"))], 
"0", stack(n("5").gain("0.00"), n("6").gain("0.26"), n("7").gain("0.26"), n("8").gain("0.26"), n("9").gain("0.00")), stack(n("5").gain("0.05"), n("6").gain("0.26"), n("7").gain("0.26"), n("8").gain("0.31"), n("9").gain("0.00")), [2, stack(n("5").gain("0.43"), n("6").gain("0.64"), n("7").gain("0.26"), n("8").gain("0.31"), n("9").gain("0.38"))], 
).slow(8).sound("sine").scale("c2:major:pentatonic").attack("0.05").velocity("0 1".slow(16))

$: n(`<
 0 [5, 8, 9]@2
 0 [5, 6, 7, 8, 9, 10, 11, 14] [5, 6, 7, 10, 14] [6, 7, 8, 9, 10, 11, 12, 13] [5, 6, 7, 8, 9, 10, 12, 13] [5, 8, 11, 12, 14]@2
 0 [5, 9, 13, 14] [6, 8, 13] [6, 7, 8, 10, 13] [8, 13]@2
 0 [5, 6, 7, 8, 9] [6, 7, 8, 9, 10] [5, 6, 7, 9, 10]@2
 0 [6, 8] [5, 6] [7]@2
 0 [5, 6, 7, 8, 11, 13, 14] [6, 11, 14] [5, 6, 7, 12, 14] [5, 8, 9, 10, 11, 12]@2
>`).fast(4).sound("sine").scale("c2:minor:pentatonic").attack("0.05").gain("0.5").velocity("1 0".slow(16))

 */
