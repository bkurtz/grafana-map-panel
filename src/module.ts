import { PanelPlugin } from '@grafana/data';
import { MapOptions, defaults } from './types';
import { MapPanel } from './MapPanel';
import { MapEditor } from './MapEditor';

export const plugin = new PanelPlugin<MapOptions>(MapPanel).setDefaults(defaults).setEditor(MapEditor);
