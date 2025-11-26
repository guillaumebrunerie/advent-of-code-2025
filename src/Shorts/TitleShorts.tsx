import { Wrapper } from "../common/Wrapper";

type TitleShortsProps = {
	title: string;
	progress: number;
	opacity?: number;
};

export const TitleShorts = ({
	title,
	progress,
	opacity = 1,
}: TitleShortsProps) => {
	return (
		<Wrapper>
			<div
				style={{
					position: "absolute",
					left: "50%",
					transform: "translateX(-50%)",
					top: "5%",
					fontSize: "30pt",
					color: "rgb(204,204,204)",
					fontWeight: "bold",
					opacity,
					lineHeight: 1.5,
				}}
			>
				Advent of Code 2025
				<div
					style={{
						position: "relative",
						backgroundColor: "#10101a",
						padding: "0 4px",
						border: "2px solid #333340",
						opacity,
					}}
				>
					<div
						style={{
							position: "absolute",
							left: 0,
							top: 0,
							backgroundColor: "#999",
							opacity: 0.2,
							width: `${progress * 100}%`,
							height: "100%",
						}}
					/>
					{title}
				</div>
			</div>
		</Wrapper>
	);
};
