export interface PolyMap {
	[key: number]: number[][2];
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
	x: number;
	y: number;
}
