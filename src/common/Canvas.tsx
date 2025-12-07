import { useEffect, useRef } from "react";
import { useVideoConfig } from "remotion";

export const Canvas = ({
	draw,
}: {
	draw: (ctx: CanvasRenderingContext2D) => void;
}) => {
	const { width, height } = useVideoConfig();
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const ctx = ref.current?.getContext("2d");
		if (!ctx) {
			return;
		}
		ctx.fillStyle = "transparent";
		ctx.clearRect(0, 0, width, height);
		draw(ctx);
	}, [width, height, draw]);
	return (
		<canvas
			width={width}
			height={height}
			ref={ref}
			style={{ position: "absolute" }}
		/>
	);
};
