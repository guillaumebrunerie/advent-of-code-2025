import { CSSProperties, ReactNode } from "react";
import { Html5Audio, staticFile } from "remotion";

import { Background } from "../common/Background";
import { FinalFlash, InitialFlash, MidFlash } from "../common/Flashes";
import { Wrapper } from "../common/Wrapper";
import { useCurrentTime } from "../common/useCurrentTime";
import { dayDuration } from "../constants";
import { Title } from "./Title";

type DayWrapperProps = {
	day: number;
	title: string;
	children: ReactNode;
	titleOpacity?: number;
	style?: CSSProperties;
};

export const DayWrapperPartial = ({
	day,
	title,
	children,
	style,
	titleOpacity,
}: DayWrapperProps) => {
	const time = useCurrentTime();
	const progress = time / dayDuration;
	return (
		<Wrapper style={style}>
			<Background />
			{children}
			<Title
				title={`Day ${day}: ${title}`}
				progress={progress}
				opacity={titleOpacity}
			/>
			<MidFlash dayDuration={dayDuration} />
			<InitialFlash />
			<FinalFlash dayDuration={dayDuration} />
			<Html5Audio src={staticFile(`Day${day}.wav`)} />
		</Wrapper>
	);
};
