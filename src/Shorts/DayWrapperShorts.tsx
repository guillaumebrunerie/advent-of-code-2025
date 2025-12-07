import { CSSProperties, ReactNode } from "react";
import { Html5Audio, staticFile } from "remotion";

import { Background } from "../common/Background";
import { FinalFlash, InitialFlash, MidFlash } from "../common/Flashes";
import { Wrapper } from "../common/Wrapper";

type DayWrapperShortsProps = {
	day: number;
	title: string;
	dayDuration: number;
	children: ReactNode;
	titleOpacity?: number;
	style?: CSSProperties;
};

export const DayWrapperShorts = ({
	day,
	dayDuration,
	children,
	style,
}: DayWrapperShortsProps) => {
	return (
		<Wrapper style={style}>
			<Background />
			{children}
			<InitialFlash />
			<MidFlash dayDuration={dayDuration} />
			<FinalFlash dayDuration={dayDuration} />
			<Html5Audio src={staticFile(`Day${day}.wav`)} />
		</Wrapper>
	);
};
