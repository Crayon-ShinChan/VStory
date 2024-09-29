import { merge } from '@visactor/vutils';
import type { CharacterChart } from '../character';
import type { IChartCharacterRuntime } from './interface';

export class CommonSpecRuntime implements IChartCharacterRuntime {
  type = 'CommonSpec';

  protected declare _character: CharacterChart;

  constructor(character: CharacterChart) {
    this._character = character;
  }

  onConfigReady() {
    const rawSpec = this._character.specProcess.getVisSpec();
    const options = this._character.specProcess.getCharacterConfig().options;
    if (!options) {
      return;
    }
    merge(rawSpec, { title: options.title, legends: options.legends, data: options.data });
  }
}
