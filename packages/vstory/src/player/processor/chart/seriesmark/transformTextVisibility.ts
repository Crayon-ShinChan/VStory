import type VChart from '@visactor/vchart';
import type { IChartVisibilityAction } from '../../interface/appear-action';
import { commonFade, commonGrow } from './commonTransformMarkAppear';

// 将payload转换为chart内置的动画type
export const transformTextVisibility = (
  instance: VChart,
  animation: IChartVisibilityAction['payload']['animation'],
  option: {
    disappear: boolean;
    markIndex: number;
  }
) => {
  switch (animation.effect) {
    case 'grow': {
      return commonGrow(instance, animation, ['scaleIn', 'scaleOut'], option);
    }
    case 'fade': {
      return commonFade(instance, animation, option);
    }
    default: {
      return commonFade(instance, animation, option);
    }
  }
};
