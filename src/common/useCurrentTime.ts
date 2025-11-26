import { useCurrentFrame, useVideoConfig } from "remotion";

export const useCurrentTime = () => {
	const { fps } = useVideoConfig();
	return useCurrentFrame() / fps;
};
