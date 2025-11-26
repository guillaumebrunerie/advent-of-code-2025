import { staticFile } from "remotion";

export const SafeAreaShorts = () => {
	return (
		<div
			style={{
				opacity: 0,
				zIndex: 1000,
				position: "absolute",
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				border: "1px solid red",
				backgroundPosition: "bottom center",
				backgroundSize: "100% 105%",
				backgroundImage: `url(${staticFile("YouTube Short Overlay.png")})`,
			}}
		></div>
	);
};
