import { Sequence, useVideoConfig } from "remotion";

import { allDays } from "../AllDays";
import { dayDuration, introDuration } from "../constants";
import { Intro } from "./Intro";

export const FullVideo = () => {
	const { fps } = useVideoConfig();
	return (
		<>
			<Sequence durationInFrames={introDuration * fps}>
				<Intro />
			</Sequence>
			{allDays.map(({ Component }, i) => (
				<Sequence
					key={i}
					from={(introDuration + i * dayDuration) * fps}
					durationInFrames={dayDuration * fps}
				>
					<Component videoType="full video" />
				</Sequence>
			))}
		</>
	);
};
