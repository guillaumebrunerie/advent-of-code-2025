import { useEffect, useMemo } from "react";
import { Easing, interpolate, useVideoConfig } from "remotion";

import { DayProps, DayWrapper, useVideoType } from "../Shorts/DayWrapper";
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

const Knob = ({
	position,
	blur,
	label,
}: {
	position: number;
	blur: number;
	label: string;
}) => {
	const innerSize = 500;
	const size = 650;
	const tickLength = 30;
	const distance = (size + tickLength) / 2;
	return (
		<>
			<div
				style={{
					position: "absolute",
					border: "5px solid #fff",
					borderRadius: "50%",
					width: innerSize,
					height: innerSize,
				}}
			/>
			<div
				style={{
					position: "absolute",
					border: "5px solid #0C0",
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
							border: `3px solid ${i == 50 ? "#FFF" : "#0C08"}`,
							width: 0,
							backgroundColor: i == 50 ? "#FFF" : "#0C08",
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
			<div
				style={{
					position: "absolute",
					fontSize: 50,
					color: "#FFF",
				}}
			>
				{label}
			</div>
		</>
	);
};

const Plus = ({ value, startTime }: { value: number; startTime: number }) => {
	const videoType = useVideoType();
	const time = useCurrentTime() - startTime;
	if (time <= 0) {
		return;
	}
	const top = interpolate(
		time,
		[0, 1],
		videoType == "short" ? [550, 300] : [100, 0],
		clamp,
	);
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

export const Day1 = ({ videoType }: DayProps) => {
	const data = useMemo(solve, []);

	const deltaIndex = 1321 + 1 - 16;

	useEffect(() => {
		console.log(
			data
				.slice(deltaIndex, deltaIndex + 16)
				.map((d) => {
					const n = Math.ceil(d.n / 2);
					const first = `stepcat(s("cp!${n}").gain(0.02)),`;
					if (d.part1) {
						return `stack(${first} s("~!${n - 1} oh").gain(0.5)),`;
					} else {
						return first;
					}
				})
				.join("\n") +
				"\n\n" +
				data
					.slice(deltaIndex + 16, deltaIndex + 32)
					.map((d) => {
						const n = Math.ceil(d.n / 2);
						const first = `stepcat(s("cp!${n}").gain(0.02)),`;
						if (d.part2 > 0) {
							return `stack(${first} s("[~!${(n - d.part2) / d.part2} oh]!${d.part2}").gain(0.5)),`;
						} else {
							return first;
						}
					})
					.join("\n"),
		);
	}, [data, deltaIndex]);

	const time = useCurrentTime();
	const isPart1 = time <= 8;
	const i = Math.floor(time * 2);
	const nt = time * 2 - i;
	const index = i + deltaIndex;
	const prevPosition = data[index]?.current;
	const nextPosition = data[index + 1].current;
	const position = interpolate(
		nt,
		[0.15, 0.85],
		[prevPosition, nextPosition],
		{
			...clamp,
			easing: Easing.linear,
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
	const { width, height } = useVideoConfig();
	return (
		<DayWrapper
			videoType={videoType}
			day={1}
			title="Secret Entrance"
			style={{
				display: "grid",
				height,
				width,
				placeItems: "center",
			}}
		>
			<Knob
				position={position}
				blur={blur}
				label={data[index].direction + data[index].n}
			/>
			{data.slice(deltaIndex - 1, deltaIndex + 32).map((d, i) => {
				if (isPart1) {
					return (
						d.part1 && (
							<Plus value={1} startTime={i / 2 - 1 / 4} key={i} />
						)
					);
				} else {
					return (
						d.part2 > 0 && (
							<Plus
								value={d.part2}
								startTime={i / 2 - 1 / 4}
								key={i}
							/>
						)
					);
				}
			})}
		</DayWrapper>
	);
};

/*
setcps(2)

$: s("lt").gain("<1.5 1>").slow(16)

_$: note("<[0 2]@4>".scale("C:minor")).sound("gm_acoustic_bass").gain(0.1)

$: cat(
stepcat(s("cp!49").gain(0.02)),
stepcat(s("cp!28").gain(0.02)),
stepcat(s("cp!10").gain(0.02)),
stack(stepcat(s("cp!38").gain(0.02)), s("~!37 oh").gain(0.5)),
stepcat(s("cp!43").gain(0.02)),
stepcat(s("cp!393").gain(0.02)),
stepcat(s("cp!43").gain(0.02)),
stepcat(s("cp!25").gain(0.02)),
stepcat(s("cp!33").gain(0.02)),
stack(stepcat(s("cp!36").gain(0.02)), s("~!35 oh").gain(0.5)),
stepcat(s("cp!48").gain(0.02)),
stack(stepcat(s("cp!2").gain(0.02)), s("~!1 oh").gain(0.5)),
stepcat(s("cp!233").gain(0.02)),
stack(stepcat(s("cp!18").gain(0.02)), s("~!17 oh").gain(0.5)),
stepcat(s("cp!31").gain(0.02)),
stack(stepcat(s("cp!19").gain(0.02)), s("~!18 oh").gain(0.5)),

stepcat(s("cp!31").gain(0.02)),
stack(stepcat(s("cp!31").gain(0.02)), s("[~!30 oh]!1").gain(0.5)),
stepcat(s("cp!44").gain(0.02)),
stepcat(s("cp!37").gain(0.02)),
stepcat(s("cp!2").gain(0.02)),
stack(stepcat(s("cp!135").gain(0.02)), s("[~!66.5 oh]!2").gain(0.5)),
stack(stepcat(s("cp!234").gain(0.02)), s("[~!57.5 oh]!4").gain(0.5)),
stack(stepcat(s("cp!6").gain(0.02)), s("[~!5 oh]!1").gain(0.5)),
stepcat(s("cp!40").gain(0.02)),
stack(stepcat(s("cp!11").gain(0.02)), s("[~!10 oh]!1").gain(0.5)),
stepcat(s("cp!46").gain(0.02)),
stepcat(s("cp!20").gain(0.02)),
stepcat(s("cp!12").gain(0.02)),
stack(stepcat(s("cp!165").gain(0.02)), s("[~!40.25 oh]!4").gain(0.5)),
stack(stepcat(s("cp!169").gain(0.02)), s("[~!55.333333333333336 oh]!3").gain(0.5)),
stack(stepcat(s("cp!169").gain(0.02)), s("[~!41.25 oh]!4").gain(0.5)),
).compress(.15, .85)
 */
