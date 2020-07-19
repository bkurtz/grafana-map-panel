import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { MapOptions, ValuePolyProps, PolyMap, PlotHoverPayload } from 'types';

interface Props extends PanelProps<MapOptions> {}

function sql2dArrayStringToArray(a: string) {
	// a will be in the format {{x1,y1}, {x2,y2}, {x3,y3}}
	return a
		.substring(2, a.length - 2)
		.split(`},{`)
		.map(x => x.split(`,`).map(y => +y));
}

function findIndexForData(val: number, series: number[]) {
	// implementation mirrored from grafana's graph tooltip
	let lower = 0;
	let upper = series.length - 1;
	let middle;
	while (true) {
		if (lower > upper) {
			return Math.max(upper, 0);
		}
		middle = Math.floor((lower + upper) / 2);
		if (series[middle] === val) {
			return middle;
		} else if (series[middle] < val) {
			lower = middle + 1;
		} else {
			upper = middle - 1;
		}
	}
}

function array_min(p: number[][]) {
	return p.reduce((a, b) => {
		return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
	});
}

function array_max(p: number[][]) {
	return p.reduce((a, b) => {
		return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
	});
}

class MapPoly extends PureComponent<ValuePolyProps> {
	render() {
		const { p, center, scale, value, maxValue } = this.props;
		const polystr = p
			.map(pt => {
				return String((pt[0] - center[0]) * scale) + ',' + String((pt[1] - center[1]) * scale);
			})
			.join(' ');

		return <polygon points={polystr} fill-opacity={value / maxValue} />;
	}
}

export class MapPanel extends PureComponent<Props> {
	state = {
		time: 0,
	};

	constructor(props: Props) {
		super(props);
		// Initialize state time
		this.state = { time: 0 };
		// Hack: Currently no official API to get sync status from other panels.  Based on introspection of the current dashboard (7.0.6), listening to 'plothover' events seems to get me the data I need.  Listen to these events directly so that we can update the power plot state accordingly.
		// Hack: Install action handlers a little later (currently in 1sec) to make sure the other panels have been created enough to exist so we can bind to their events.
		// bind functions
		let thisPanel = this;
		setTimeout(() => {
			// I was expecting to use `plotleave` event here instead of `mouseout`, but it never seems to get called, so use `mouseout` instead.
			$('div.graph-panel__chart').bind('mouseout', (event: any, pos: any, item: any) => {
				if (thisPanel.state.time !== 0) {
					thisPanel.setState({ time: 0 });
				}
			});
			$('div.graph-panel__chart').bind('plothover', (event: any, pos: PlotHoverPayload, item: any) => {
				if (thisPanel.state.time !== pos.x) {
					thisPanel.setState({ time: pos.x });
				}
			});
		}, 1000);
	}

	render() {
		const { options, data, width, height } = this.props;

		const powerData = data.series.filter(x => x.refId === 'A');
		const polyData = data.series.filter(x => x.refId === 'B');
		// Get the configured map polygon coordinates, either from a data source (should be query B) or from the configuration
		let polys: PolyMap = {};
		if (polyData.length) {
			let polyRaw = polyData[0].fields[1].values;
			let polyId = polyData[0].fields[0].values;
			for (let i = 0; i < polyId.length; i++) {
				polys[String(polyId.get(i))] = sql2dArrayStringToArray(polyRaw.get(i));
			}
		} else {
			polys = options.polys;
		}
		// Compute map bounds
		let poly_list = Object.keys(polys).map(k => polys[k]);
		const min_coord = array_min(poly_list.map(array_min));
		const max_coord = array_max(poly_list.map(array_max));
		const center = [(min_coord[0] + max_coord[0]) / 2, (min_coord[1] + max_coord[1]) / 2];
		const scale_x = width / (max_coord[0] - min_coord[0]);
		const scale_y = height / (max_coord[1] - min_coord[1]);
		const scale = Math.min(scale_x, scale_y);

		// compute maximum power
		let max_power = 1.0; // TODO: eventually pull this from an option
		for (const p of powerData) {
			max_power = p.fields
				.find(field => field.type === 'number')
				?.values.toArray()
				.reduce((a, b) => Math.max(a, b), max_power);
		}

		// generate polygons
		const mapPolys = powerData.map(p => {
			let panelID: string = p.name as string;
			let panelPoly: number[][] = polys[panelID];
			const allPower = p.fields.find(field => field.type === 'number')?.values;
			const allTime = p.fields.find(field => field.type === 'time')?.values;
			let power = 0;
			if (allPower?.length) {
				if (this.state.time === 0) {
					// No timestamp set, use the latest data
					power = allPower?.get(allPower?.length - 1);
				} else {
					const ind = findIndexForData(this.state.time, allTime?.toArray() as number[]);
					power = allPower?.get(ind);
				}
			}
			return <MapPoly p={panelPoly} center={center} scale={scale} value={power} maxValue={max_power} />;
		});

		// TODO: eventually pull fill/stroke styles from an option
		return (
			<div
				style={{
					position: 'relative',
					width,
					height,
				}}
			>
				<svg
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
					}}
					width={width}
					height={height}
					xmlns="http://www.w3.org/2000/svg"
					xmlnsXlink="http://www.w3.org/1999/xlink"
					viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
				>
					<g transform="scale(1,-1)" fill="#32a852" stroke="#32a852">
						{mapPolys}
					</g>
				</svg>

				{/*<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						padding: '10px',
					}}
				>
					<div>Count: {data.series.length}</div>
					<div>{options.text}</div>
				</div>*/}
			</div>
		);
	}
}
