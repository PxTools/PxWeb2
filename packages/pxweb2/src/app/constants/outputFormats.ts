import type { IconProps } from '@pxweb2/pxweb2-ui';
import { OutputFormatType } from '@pxweb2/pxweb2-api-client';

export interface FileFormat {
  value: string;
  outputFormat: OutputFormatType;
  iconName: IconProps['iconName'];
}

export const fileFormats: FileFormat[] = [
  {
    value: 'excel',
    outputFormat: OutputFormatType.XLSX,
    iconName: 'FileText',
  },
  {
    value: 'csv',
    outputFormat: OutputFormatType.CSV,
    iconName: 'FileText',
  },
  {
    value: 'px',
    outputFormat: OutputFormatType.PX,
    iconName: 'FileCode',
  },
  {
    value: 'jsonstat2',
    outputFormat: OutputFormatType.JSON_STAT2,
    iconName: 'FileCode',
  },
  {
    value: 'html',
    outputFormat: OutputFormatType.HTML,
    iconName: 'FileCode',
  },
  // {
  //   value: 'parquet',
  //   outputFormat: OutputFormatType.PARQUET,
  //   iconName: 'FileCode',
  // },
];
