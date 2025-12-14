import { loadFont } from "@remotion/google-fonts/SourceCodePro";

export const { fontFamily } = loadFont("normal", { subsets: ["latin"] });

export const width = 1920;
export const height = 1080;
export const fps = 60;

export const dayDuration = 16;
export const introDuration = 7;
export const outroDuration = 8;

// Shorts

export const widthShorts = 1080;
export const heightShorts = 1920;
export const fpsShorts = 60;

export const introDurationShorts = 8;
export const outroDurationShorts = 8;

// Colors

export const black = "#0F0F23";
export const grey = "#444444";
export const white = "#AAAAAA";

export const red = "#FFFF66";

export const clamp = {
	extrapolateLeft: "clamp",
	extrapolateRight: "clamp",
} as const;
