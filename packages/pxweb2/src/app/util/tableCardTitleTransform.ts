import { getConfig } from './config/getConfig';
import type { Config } from './config/configType';

type TableCardTitleTransformConfig = NonNullable<
  Config['tableCardTitleTransform']
>;

export function applyTableCardTitleTransform(
  title: string,
  transformConfig?: TableCardTitleTransformConfig,
): string {
  const transform = transformConfig ?? getConfig().tableCardTitleTransform;

  if (!transform?.pattern) {
    return title;
  }

  try {
    return title.replace(
      new RegExp(transform.pattern, transform.flags ?? ''),
      transform.replacement ?? '',
    );
  } catch {
    return title;
  }
}
