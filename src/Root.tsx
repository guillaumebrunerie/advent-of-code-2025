import { Fragment } from "react/jsx-runtime";
import { z } from "zod";

import { Composition } from "remotion";

import { allDays } from "./AllDays";
import { FullVideo } from "./FullVideo/FullVideo";
import { Intro } from "./FullVideo/Intro";
import { IntroShorts } from "./Shorts/IntroShorts";
import {
	dayDuration,
	fps,
	fpsShorts,
	height,
	heightShorts,
	introDuration,
	outroDuration,
	width,
	widthShorts,
} from "./constants";

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="Intro"
				component={Intro}
				durationInFrames={introDuration * fps}
				fps={fps}
				width={width}
				height={height}
			/>
			{allDays.map(({ Component, day }) => (
				<Composition
					key={day}
					id={`Day${day}`}
					component={Component}
					durationInFrames={dayDuration * fps}
					fps={fps}
					schema={z.object({
						videoType: z.enum(["short", "full video"]),
					})}
					calculateMetadata={({ props }) =>
						props.videoType === "short" ?
							{ width: widthShorts, height: heightShorts }
						:	{ width, height }
					}
					defaultProps={{ videoType: "short" }}
				/>
			))}
			<Composition
				id="FullVideo"
				component={FullVideo}
				durationInFrames={
					(introDuration +
						dayDuration * allDays.length +
						outroDuration) *
					fps
				}
				fps={fps}
				width={width}
				height={height}
			/>
		</>
	);
};
