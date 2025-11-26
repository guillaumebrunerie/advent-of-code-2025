import {
	AbsoluteFill,
	Html5Audio,
	Sequence,
	interpolate,
	staticFile,
} from "remotion";

import { FinalFlash } from "../common/Flashes";
import { Wrapper } from "../common/Wrapper";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp, introDuration } from "../constants";

export const Intro = () => {
	const time = useCurrentTime();

	const fadeOut = 1;

	const fadeIn = interpolate(time, [1.5, 2], [0, 1], clamp);

	const fadeIn2 = interpolate(time, [3.5, 4], [0, 1], clamp);

	const opacity = fadeIn * fadeOut;
	const opacity2 = fadeIn2 * fadeOut;

	return (
		<Wrapper>
			<AbsoluteFill
				style={{
					backgroundColor: "#0F0F23",
					fontSize: 70,
					fontWeight: 300,
					display: "grid",
					alignItems: "center",
					justifyItems: "center",
					color: "#00CC00",
					padding: "200px 0",
				}}
			>
				<div
					style={{
						opacity,
						textShadow: "0 0 4px #00cc00, 0 0 10px #00cc00",
					}}
				>
					Advent of code 2025
				</div>
				<div
					style={{
						color: "#CCCCCC",
						opacity: opacity2,
					}}
				>
					Visualizations by{" "}
					<span
						style={{
							color: "#FFFFFF",
							textShadow: "0 0 10px #ffffff",
						}}
					>
						Guillaume Brunerie
					</span>
				</div>
			</AbsoluteFill>
			<Html5Audio src={staticFile("Intro.wav")} />
			<FinalFlash dayDuration={introDuration} />
		</Wrapper>
	);
};
