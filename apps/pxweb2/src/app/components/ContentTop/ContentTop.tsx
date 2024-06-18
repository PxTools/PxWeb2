import cl from 'clsx';

import classes from './ContentTop.module.scss';

import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Icon,
  Link,
} from '@pxweb2/pxweb2-ui';
import styles from './ContentTop.module.scss';

export function ContentTop() {
  return (
    <div className={cl(classes[`content-top`])}>
      <div className={cl(classes.breadcrumbs)}>
        <div className={cl(classes[`breadcrumbs-wrapper`])}>
          <Link href="#" inline>
            <BodyLong>PxWeb 2.0</BodyLong>
          </Link>
          <Icon iconName="ChevronRight"></Icon>
          <BodyLong>Static title</BodyLong>
        </div>
      </div>
      <div className={cl(classes[`heading-information`])}>
        <Heading size="large">Dymanic title</Heading>
        <div className={cl(classes.information)}>
          <Button variant="secondary">Information</Button>
          <BodyShort size='medium'>Last updated</BodyShort>
        </div>
      </div>
    </div>
  );
}

export default ContentTop;
