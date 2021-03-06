export interface PolyMap {
	[key: string]: number[][];
}

export interface MapOptions {
	text: string;
	polys: PolyMap;
}

export const defaults: MapOptions = {
	text: 'The default text!',
	polys: {},
};

export interface ValuePolyProps {
	p: number[][];
	center: number[];
	scale: number;
	value: number;
	maxValue: number;
}

// Copied-ish from grafana's GraphTooltip or something
export interface PlotHoverPayload {
	x: number;
	y: number;
}
