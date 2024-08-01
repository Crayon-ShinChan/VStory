import type { IComponent, ISeries, IVChart } from '@visactor/vchart';
import { isObject, isString, merge } from '@visactor/vutils';
import type { ICharacter } from '../../../story/character';
import type { IAction } from '../../../story/interface';
import { ActionProcessorItem } from '../processor-item';
import type { EasingType, IGraphic } from '@visactor/vrender-core';
import type { IFadeInParams, IScaleInParams, IWipeInParams } from '../interface/appear-action';
import { canDoGraphicAnimation } from './utils';
import { Wipe } from '../../../animate/wipeIn';

// export const appearEffectMap = {
//   fade: fadeIn,
//   scale: scaleIn,
//   // move: moveIn,
//   wipe: wipeIn
// };

export function fadeIn(graphic: IGraphic, params: IFadeInParams): boolean {
  if (!canDoGraphicAnimation(graphic, params)) {
    return false;
  }
  const { fade = {} } = params;
  const opacity = fade.opacity ?? params.opacity ?? 1;
  const duration = fade.duration ?? params.duration;
  const easing = fade.easing ?? params.easing;
  const isBaseOpacity = fade.isBaseOpacity ?? false;
  const opacityKey = isBaseOpacity ? 'baseOpacity' : 'opacity';

  graphic.setAttributes({
    [opacityKey]: 0
  });

  graphic.animate().to({ [opacityKey]: opacity }, duration, easing as EasingType);

  return true;
}

export function scaleIn(graphic: IGraphic, params: IScaleInParams): boolean {
  if (!canDoGraphicAnimation(graphic, params)) {
    return false;
  }
  const { scale = {} } = params;
  const ratio = scale.ratio ?? params.ratio ?? 1;
  const duration = scale.duration ?? params.duration;
  const easing = scale.easing ?? params.easing;

  graphic.setAttributes({
    scaleX: 0,
    scaleY: 0
  });
  graphic.animate().to({ scaleX: ratio, scaleY: ratio }, duration, easing as EasingType);

  return true;
}

const Direction = {
  left: 0,
  right: 1,
  top: 2,
  bottom: 3,
  stroke: 4
};

export function wipeIn(graphic: IGraphic, params: IWipeInParams) {
  if (!canDoGraphicAnimation(graphic, params)) {
    return false;
  }

  const { wipe = {} } = params;
  const from = wipe.from ?? params.from ?? 'left';
  const duration = wipe.duration ?? params.duration;
  const easing = wipe.easing ?? params.easing;

  const { fill } = graphic.attribute;
  if (isString(fill)) {
    graphic.animate().play(
      new Wipe({}, {}, duration, easing as EasingType, {
        direction: Direction[from]
      })
    );
  } else if (isObject(fill)) {
    // 渐变色支持
  }
  return true;
}

export class CommonAppearActionProcessor extends ActionProcessorItem {
  name: 'appear';

  constructor() {
    super();
  }

  getStartTimeAndDuration(action: IAction): { startTime: number; duration: number } {
    const { startTime: globalStartTime = 0, duration: globalDuration } = action;
    const { startTime = 0, duration = 0 } = action.payload?.animation ?? ({} as any);

    const st = globalStartTime + startTime;
    const d = globalDuration ?? duration;
    return {
      startTime: st,
      duration: d
    };
  }

  run(character: ICharacter, actionSpec: IAction): void {
    const { animation } = actionSpec.payload ?? {};
    const { effect = 'fadeIn' } = animation ?? ({} as any);

    let effectFunc = fadeIn;
    switch (effect) {
      case 'scaleIn':
        effectFunc = scaleIn;
        break;
      case 'wipeIn':
        effectFunc = wipeIn;
        break;
    }
    // 获取相关图形
    const graphics = this.getCharacterByEffect(character, effect);
    // 执行appearEffect
    graphics.forEach(graphic => effectFunc(graphic, animation as any));
  }

  protected getCharacterParentGraphic(character: ICharacter) {
    return character.getGraphicParent();
  }

  protected getCharacterGraphic(character: ICharacter) {
    return character.getGraphicParent().getChildren() as IGraphic[];
  }

  protected getCharacterByEffect(character: ICharacter, effect: 'move' | string) {
    // 图表仅操作父节点.
    // @ts-ignore
    if (character._graphic.type === 'chart') {
      return [this.getCharacterParentGraphic(character)];
    }
    // move效果, 一定是对parent的操作
    return effect === 'move' ? [this.getCharacterParentGraphic(character)] : this.getCharacterGraphic(character);
  }
}
