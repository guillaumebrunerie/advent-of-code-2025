import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

import { clamp, white } from "../constants";
import { useCurrentTime } from "./useCurrentTime";

const attackDuration = 0.04;

export const InitialFlash = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = interpolate(frame / fps, [0, 1], [1, 0], {
		...clamp,
		easing: Easing.out(Easing.cubic),
	});
	return <AbsoluteFill style={{ backgroundColor: white, opacity }} />;
};

export const FinalFlash = ({ dayDuration }: { dayDuration: number }) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame / fps,
		[dayDuration - attackDuration, dayDuration],
		[0, 1],
		clamp,
	);
	return <AbsoluteFill style={{ backgroundColor: white, opacity }} />;
};

export const MidFlash = ({ dayDuration }: { dayDuration: number }) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();
	const fadeIn = interpolate(
		frame / fps,
		[dayDuration / 2 - attackDuration, dayDuration / 2],
		[0, 1],
		clamp,
	);
	const fadeOut = interpolate(
		frame / fps,
		[dayDuration / 2, dayDuration / 2 + 1],
		[1, 0],
		{ ...clamp, easing: Easing.out(Easing.cubic) },
	);
	const opacity = fadeIn * fadeOut * 0.5;
	return <AbsoluteFill style={{ backgroundColor: white, opacity }} />;
};

export const Flash = ({
	flashTime,
	intensity,
}: {
	flashTime: number;
	intensity: number;
}) => {
	const time = useCurrentTime();
	const fadeIn = interpolate(
		time,
		[flashTime - attackDuration, flashTime],
		[0, 1],
		clamp,
	);
	const fadeOut = interpolate(time, [flashTime, flashTime + 1], [1, 0], {
		...clamp,
		easing: Easing.out(Easing.cubic),
	});
	const opacity = fadeIn * fadeOut * intensity;
	return <AbsoluteFill style={{ backgroundColor: white, opacity }} />;
};
