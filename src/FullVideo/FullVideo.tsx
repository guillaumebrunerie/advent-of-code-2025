import { Sequence, useVideoConfig } from "remotion";

import { allDays } from "../AllDays";
import { dayDuration, introDuration, outroDuration } from "../constants";
import { Intro } from "./Intro";
import { Outro } from "./Outro";

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
			{true && (
				<Sequence
					from={(introDuration + allDays.length * dayDuration) * fps}
					durationInFrames={outroDuration * fps}
				>
					<Outro />
				</Sequence>
			)}
		</>
	);
};
