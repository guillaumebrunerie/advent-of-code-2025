import { useMemo } from "react";
import { Easing, interpolate } from "remotion";

import { DayWrapperShorts } from "../Shorts/DayWrapperShorts";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp, heightShorts, widthShorts } from "../constants";
import { raw } from "./raw";

const solve = () => {
	let password1 = 0;
	let password2 = 0;
	let current = 50;
	let current2 = 50;
	const lines = raw.trim().split("\n");
	const parsedLines = [];
	for (const line of lines) {
		const direction = line[0];
		const n = parseInt(line.slice(1), 10);
		const parsedLine = {
			direction,
			n,
			current: current2,
			part1: false,
			part2: 0,
		};
		parsedLines.push(parsedLine);
		const wasZero = current == 0;
		if (direction == "R") {
			current += n;
			current2 += n;
		} else {
			current -= n;
			current2 -= n;
		}
		const oldPassword2 = password2;
		if (current >= 100) {
			password2 += Math.floor(current / 100);
		} else if (current <= 0) {
			password2 += Math.ceil((-current + 1) / 100);
			if (wasZero) {
				password2--;
			}
		}
		parsedLine.part2 = password2 - oldPassword2;
		current = ((current % 100) + 100) % 100;
		if (current == 0) {
			password1++;
			parsedLine.part1 = true;
		}
	}
	console.log("Part 1:", password1);
	console.log("Part 2:", password2);
	return parsedLines;
};

// Answer: 980/5961

const Knob = ({ position, blur }: { position: number; blur: number }) => {
	const innerSize = 500;
	const size = 650;
	const tickLength = 30;
	const distance = (size + tickLength) / 2;
	return (
		<>
			<div
				style={{
					position: "absolute",
					border: "3px solid #fff",
					borderRadius: "50%",
					width: innerSize,
					height: innerSize,
				}}
			/>
			<div
				style={{
					position: "absolute",
					border: "3px solid #0C0",
					borderRadius: "50%",
					width: size,
					height: size,
				}}
			/>
			{Array(100)
				.fill(null)
				.map((_, i) => (
					<div
						key={i}
						style={{
							position: "absolute",
							border: `2px solid ${i == 50 ? "#FFF" : "#0C08"}`,
							width: 3,
							height: tickLength,
							transform: `rotate(${(i * 360) / 100}deg) translateY(${distance}px)`,
						}}
					/>
				))}
			<div
				style={{
					position: "absolute",
					border: `2px solid #FFF`,
					filter: `blur(${blur}px)`,
					width: 3,
					height: (size - innerSize) / 2,
					transform: `rotate(${((position + 50) * 360) / 100}deg) translateY(${(size + innerSize) / 4}px)`,
				}}
			/>
		</>
	);
};

const Plus = ({ value, startTime }: { value: number; startTime: number }) => {
	const time = useCurrentTime() - startTime;
	if (time <= 0) {
		return;
	}
	const top = interpolate(time, [0, 1], [550, 300], clamp);
	const opacity = interpolate(time, [0, 1], [1, 0], clamp);
	return (
		<div
			style={{
				position: "absolute",
				top,
				opacity,
				fontSize: 50,
				color: "#FFF",
			}}
		>
			+{value}
		</div>
	);
};

export const Day1Short = () => {
	const data = useMemo(solve, []);

	// data.forEach((d, i) => {
	// 	if (i < 16) {
	// 		return;
	// 	}
	// 	if (!d.part1) {
	// 		return;
	// 	}
	// 	const before = data.slice(i - 16, i).filter((a) => a.part1).length;
	// 	if (before < 3) {
	// 		return;
	// 	}
	// 	const afterCount = data
	// 		.slice(i + 1, i + 16)
	// 		.filter((a) => a.part2 > 1).length;
	// 	if (afterCount < 4) {
	// 		return;
	// 	}
	// 	const afterMax = Math.max(
	// 		...data.slice(i + 1, i + 16).map((a) => a.part2),
	// 	);
	// 	if (afterMax > 5) {
	// 		return;
	// 	}
	// 	console.log(i);
	// });

	const deltaIndex = 1321 + 1 - 16;
	const time = useCurrentTime();
	const isPart1 = time <= 8;
	const i = Math.floor(time * 2);
	const nt = time * 2 - i;
	const prevPosition = data[i + deltaIndex]?.current;
	const nextPosition = data[i + 1 + deltaIndex].current;
	const position = interpolate(
		nt,
		[0.15, 0.85],
		[prevPosition, nextPosition],
		{
			...clamp,
			easing: Easing.back(1),
		},
	);
	const blur = interpolate(
		Math.sin(nt * Math.PI),
		[Math.sin(0.25 * Math.PI), 1],
		[0, 3],
		{
			...clamp,
		},
	);
	return (
		<DayWrapperShorts
			day={1}
			title="Secret Entrance"
			dayDuration={16}
			style={{
				display: "grid",
				height: heightShorts,
				width: widthShorts,
				placeItems: "center",
			}}
		>
			<Knob position={position} blur={blur} />
			{data.slice(deltaIndex - 1, deltaIndex + 31).map((d, i) => {
				if (isPart1) {
					return (
						d.part1 && <Plus value={1} startTime={i / 2} key={i} />
					);
				} else {
					return (
						d.part2 > 0 && (
							<Plus value={d.part2} startTime={i / 2} key={i} />
						)
					);
				}
			})}
		</DayWrapperShorts>
	);
};
Day1Short.duration = 16;
