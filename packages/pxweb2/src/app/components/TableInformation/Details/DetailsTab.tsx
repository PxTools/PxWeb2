import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './DetailsTab.module.scss';
import { Details } from './Details';
import { PxTableMetadata } from '@pxweb2/pxweb2-ui';
import {
  getContentValues,
  getUnitDetails,
  getReferencePeriodDetails,
  getBasePeriodDetails,
  ContentDetails,
} from './utils';

export type DetailsTabProps = {
  readonly tableMetadata: PxTableMetadata;
};

export function DetailsTab({ tableMetadata }: DetailsTabProps) {
  const { t } = useTranslation();

  const contentValues = getContentValues(tableMetadata);

  const unitDetails: ContentDetails[] = getUnitDetails(contentValues);
  const referencePeriodDetails: ContentDetails[] =
    getReferencePeriodDetails(contentValues);
  const basePeriodDetails: ContentDetails[] =
    getBasePeriodDetails(contentValues);

  return (
    <div className={cl(classes.detailsTab)}>
      {tableMetadata.updated && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.last_updated',
          )}
          icon="Clock"
          value={t('date.simple_date_with_time', {
            value: new Date(tableMetadata.updated),
          })}
        ></Details>
      )}
      {tableMetadata.nextUpdate && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.next_update',
          )}
          icon="ClockDashedForward"
          value={t('date.simple_date_with_time', {
            value: new Date(tableMetadata.nextUpdate),
          })}
        ></Details>
      )}
      {tableMetadata.source && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.source',
          )}
          icon="FileCheckmark"
          value={tableMetadata.source}
        ></Details>
      )}
      <Details
        heading={t(
          'presentation_page.main_content.about_table.details.official_statistics',
        )}
        icon="SealCheckmark"
        type="boolean"
        value={tableMetadata.officialStatistics}
      ></Details>
      {unitDetails.length > 0 && (
        <Details
          heading={t('presentation_page.main_content.about_table.details.unit')}
          icon="Ruler"
        >
          {unitDetails}
        </Details>
      )}
      {referencePeriodDetails.length > 0 && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.reference_time',
          )}
          icon="HourglassTopFilled"
        >
          {referencePeriodDetails}
        </Details>
      )}
      {basePeriodDetails.length > 0 && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.base_time',
          )}
          icon="TrendUp"
        >
          {basePeriodDetails}
        </Details>
      )}
      {tableMetadata.updateFrequency && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.update_frequency',
          )}
          icon="ArrowsCirclePath"
          value={tableMetadata.updateFrequency}
        ></Details>
      )}
      {tableMetadata.survey && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.survey',
          )}
          icon="DocPencil"
          value={tableMetadata.survey}
        ></Details>
      )}
      {tableMetadata.link && (
        <Details
          heading={t('presentation_page.main_content.about_table.details.link')}
          icon="Link"
          value={tableMetadata.link}
        ></Details>
      )}
      {tableMetadata.copyright !== undefined && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.copyright',
          )}
          icon="Copyright"
          type="boolean"
          value={tableMetadata.copyright}
        ></Details>
      )}
      {tableMetadata.matrix && (
        <Details
          heading={t(
            'presentation_page.main_content.about_table.details.matrix',
          )}
          icon="MenuGrid"
          value={tableMetadata.matrix}
        ></Details>
      )}
    </div>
  );
}
