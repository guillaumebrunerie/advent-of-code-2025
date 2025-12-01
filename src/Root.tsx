import { Fragment } from "react/jsx-runtime";

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
	introDurationShorts,
	outroDuration,
	width,
	widthShorts,
} from "./constants";

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="IntroShorts"
				component={IntroShorts}
				durationInFrames={introDurationShorts * fpsShorts}
				fps={fpsShorts}
				width={widthShorts}
				height={heightShorts}
			/>
			<Composition
				id="Intro"
				component={Intro}
				durationInFrames={introDuration * fps}
				fps={fps}
				width={width}
				height={height}
			/>
			{allDays.map(({ Short, Full, Partial, day }, i) => (
				<Fragment key={i}>
					{Short && (
						<Composition
							id={`Day${day}Short`}
							component={Short}
							durationInFrames={Short.duration * fps}
							fps={fps}
							width={widthShorts}
							height={heightShorts}
						/>
					)}
					{Full && (
						<Composition
							id={`Day${day}Full`}
							component={Full}
							durationInFrames={Full.duration * fps}
							fps={fps}
							width={width}
							height={height}
						/>
					)}
					{Partial && (
						<Composition
							id={`Day${day}Partial`}
							component={Partial}
							durationInFrames={Partial.duration * fps}
							fps={fps}
							width={width}
							height={height}
						/>
					)}
				</Fragment>
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
