import {
	CSSProperties,
	ReactNode,
	createContext,
	use,
	useContext,
} from "react";
import { Html5Audio, staticFile } from "remotion";

import { Title } from "../FullVideo/Title";
import { Background } from "../common/Background";
import { FinalFlash, InitialFlash, MidFlash } from "../common/Flashes";
import { Wrapper } from "../common/Wrapper";
import { useCurrentTime } from "../common/useCurrentTime";
import { dayDuration } from "../constants";

type DayWrapperProps = {
	videoType: "short" | "full video";
	day: number;
	title: string;
	children: ReactNode;
	titleOpacity?: number;
	style?: CSSProperties;
	skipFinalFlash?: boolean;
};

export const DayWrapper = ({
	videoType,
	day,
	title,
	titleOpacity,
	children,
	style,
	skipFinalFlash,
}: DayWrapperProps) => {
	const time = useCurrentTime();
	const progress = time / dayDuration;
	return (
		<Wrapper style={style}>
			<Background />
			<VideoTypeContext value={videoType}>{children}</VideoTypeContext>
			{videoType == "full video" && (
				<Title
					title={`Day ${day}: ${title}`}
					progress={progress}
					opacity={titleOpacity}
				/>
			)}
			<InitialFlash />
			<MidFlash dayDuration={dayDuration} />
			{!skipFinalFlash && <FinalFlash dayDuration={dayDuration} />}
			<Html5Audio src={staticFile(`Day${day}.wav`)} />
			<Html5Audio src={staticFile(`Boom.wav`)} />
		</Wrapper>
	);
};

const VideoTypeContext = createContext<VideoType | null>(null);
export const useVideoType = () => {
	const videoType = use(VideoTypeContext);
	if (!videoType) {
		throw new Error("No video type");
	}
	return videoType;
};

export type VideoType = "short" | "full video";
export type DayProps = {
	videoType: VideoType;
};
