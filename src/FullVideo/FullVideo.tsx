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
			{allDays.map(({ Partial }, i) => (
				<Sequence
					key={i}
					from={(introDuration + i * dayDuration) * fps}
					durationInFrames={dayDuration * fps}
				>
					<Partial />
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
