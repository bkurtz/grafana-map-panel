import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { MapOptions, ValuePolyProps, PolyMap } from 'types';

interface Props extends PanelProps<MapOptions> {}

class MapPoly extends PureComponent<ValuePolyProps> {
	render() {
		const { x, y } = this.props;
		const s = 50;

		return <polygon style={{ fill: '#32a852' }} points={`${x},${y} ${x+s},${y} ${x+s},${y+s} ${x},${y+s}`} />;
	}
}

export class MapPanel extends PureComponent<Props> {
	render() {
		const { options, data, width, height } = this.props;

		//const powerData = data.series.filter((x) => (x.refId==="A"));
		const polyData = data.series.filter((x) => (x.refId==="B"));
		let polys: PolyMap = {};
		if(polyData.length) {
			let polyRaw = polyData[0].fields[1].values;
			let polyId = polyData[0].fields[0].values;
			for(let i = 0; i < polyId.length; i++) {
				polys[polyId.get(i)] = polyRaw.get(i);
			}
		} else {
			polys = options.polys;
		}

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
					<g>
						<MapPoly x={20} y={20} />
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
