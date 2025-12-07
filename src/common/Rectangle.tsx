import { CSSProperties, ReactNode } from "react";
import { useVideoConfig } from "remotion";

export const Rectangle = ({
	x,
	y,
	cx = false,
	cy = false,
	w,
	h,
	style,
	children,
}: {
	x?: number;
	y?: number;
	cx?: boolean;
	cy?: boolean;
	w?: number;
	h?: number;
	style?: CSSProperties;
	children?: ReactNode;
}) => {
	const { width, height } = useVideoConfig();
	w = w ?? width;
	h = h ?? height;
	x = x ?? (cx ? width / 2 : 0);
	y = y ?? (cy ? height / 2 : 0);
	return (
		<div
			style={{
				position: "absolute",
				transform: `translate(${cx ? "-50%" : "0"}, ${cy ? "-50%" : "0"})`,
				width: w,
				height: h,
				left: `${x}px`,
				top: `${y}px`,
				textAlign: cx ? "center" : "left",
				...style,
			}}
		>
			{children}
		</div>
	);
};
