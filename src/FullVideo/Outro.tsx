import { AbsoluteFill, Html5Audio, interpolate, staticFile } from "remotion";

import { Background } from "../common/Background";
import { InitialFlash } from "../common/Flashes";
import { Wrapper } from "../common/Wrapper";
import { useCurrentTime } from "../common/useCurrentTime";
import { clamp } from "../constants";

export const Outro = () => {
	const time = useCurrentTime();

	const fadeOut = interpolate(time % 8, [5.5, 6], [1, 0], clamp);

	const opacity = fadeOut;

	return (
		<Wrapper>
			<Background />
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
					opacity,
				}}
			>
				Thank you for watching!
			</AbsoluteFill>
			{false && (
				<AbsoluteFill
					style={{
						color: "#CCC",
						fontSize: 60,
						fontWeight: 300,
						textAlign: "center",
						top: "650px",
						opacity,
					}}
				>
					(day 25 is coming soon)
				</AbsoluteFill>
			)}
			{false && <Html5Audio src={staticFile("Outro.wav")} />}
			<InitialFlash />
		</Wrapper>
	);
};
