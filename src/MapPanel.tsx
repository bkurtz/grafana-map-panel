import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { MapOptions, ValuePolyProps, PolyMap } from 'types';

interface Props extends PanelProps<MapOptions> {}

function sql2dArrayStringToArray (a:string) {
	// a will be in the format {{x1,y1}, {x2,y2}, {x3,y3}}
	return a.substring(2,a.length-2).split(`},{`).map(x=>x.split(`,`).map(y=>+y));
}

class MapPoly extends PureComponent<ValuePolyProps> {
	render() {
		const { p } = this.props;
		const polystr = p.map( (pt) => {
			return String(pt[0]*10) + "," + String(pt[1]*10);
		}).join(" ");

		return <polygon style={{ fill: '#32a852' }} points={polystr} />;
	}
}

export class MapPanel extends PureComponent<Props> {
	render() {
		const { options, data, width, height } = this.props;

		const powerData = data.series.filter((x) => (x.refId==="A"));
		const polyData = data.series.filter((x) => (x.refId==="B"));
		// Get the configured map polygon coordinates, either from a data source (should be query B) or from the configuration
		let polys: PolyMap = {};
		if(polyData.length) {
			let polyRaw = polyData[0].fields[1].values;
			let polyId = polyData[0].fields[0].values;
			for(let i = 0; i < polyId.length; i++) {
				polys[String(polyId.get(i))] = sql2dArrayStringToArray(polyRaw.get(i));
			}
		} else {
			polys = options.polys;
		}

		// generate polygons
		const mapPolys = powerData.map( (p) => {
			let panelID: string = p.name as string;
			let panelPoly: number[][] = polys[panelID];
			return <MapPoly p={panelPoly} />
		});

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
					<g transform="scale(200000,-200000) translate(1,-1)">
						{mapPolys}
					</g>
				</svg>

				<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						padding: '10px',
					}}
				>
					<div>Count: {data.series.length}</div>
					<div>{options.text}</div>
				</div>
			</div>
		);
	}
}
