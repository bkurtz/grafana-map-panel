import { PanelPlugin } from '@grafana/data';
import { MapOptions, defaults } from './types';
import { MapPanel } from './MapPanel';

export const plugin = new PanelPlugin<MapOptions>(MapPanel).setDefaults(defaults).setPanelOptions(builder => {
	return builder.addTextInput({
		path: 'text',
		name: 'Simple text option',
		description: 'Additional text to show on map',
		defaultValue: '',
	});
});
