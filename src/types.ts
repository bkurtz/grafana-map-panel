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
}
