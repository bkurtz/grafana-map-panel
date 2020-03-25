import React, { PureComponent } from 'react';
import { FormField } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';

import { MapOptions } from './types';

export class MapEditor extends PureComponent<PanelEditorProps<MapOptions>> {
	onTextChanged = ({ target }: any) => {
		this.props.onOptionsChange({ ...this.props.options, text: target.value });
	};

	render() {
		const { options } = this.props;

		return (
			<div className="section gf-form-group">
				<h5 className="section-heading">Display</h5>
				<FormField label="Text" labelWidth={5} inputWidth={20} type="text" onChange={this.onTextChanged} value={options.text || ''} />
			</div>
		);
	}
}
