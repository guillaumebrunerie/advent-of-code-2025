import { CSSProperties, ReactNode } from "react";
import { Html5Audio, staticFile } from "remotion";

import { Background } from "../common/Background";
import { Flash } from "../common/Flashes";
import { Wrapper } from "../common/Wrapper";

type DayWrapperFullProps = {
	day: number;
	dayDuration: number;
	children: ReactNode;
	style?: CSSProperties;
};

export const DayWrapperFull = ({
	day,
	dayDuration,
	children,
	style,
}: DayWrapperFullProps) => {
	return (
		<Wrapper style={style}>
			<Background />
			{children}
			{Array.from({ length: dayDuration / 8 - 1 }).map((_, i) => (
				<Flash key={i} flashTime={(i + 1) * 8} intensity={0.5} />
			))}
			<Html5Audio src={staticFile(`Day${day}.wav`)} />
		</Wrapper>
	);
};
