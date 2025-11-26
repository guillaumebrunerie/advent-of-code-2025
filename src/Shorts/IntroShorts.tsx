import { AbsoluteFill, interpolate } from "remotion";

import { FinalFlash } from "../common/Flashes";
import { Wrapper } from "../common/Wrapper";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp, introDurationShorts } from "../constants";

export const IntroShorts = () => {
	const time = useCurrentTime();
	const opacity = interpolate(time, [1, 4], [0, 1], clamp);
	const opacity2 = interpolate(time, [3, 4], [0, 1], clamp);
	const opacity3 = time <= 5 ? 0 : 1; // - (time * 2 - Math.floor(time * 2));

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
					Day 2 visualization
				</div>
				<div
					style={{
						color: "#CCCCCC",
						opacity: opacity3,
					}}
				>
					{Math.floor(9 - time)}...
				</div>
			</AbsoluteFill>
			<FinalFlash dayDuration={introDurationShorts} />
		</Wrapper>
	);
};
