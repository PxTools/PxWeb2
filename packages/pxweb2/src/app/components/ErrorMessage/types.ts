import {
  BackgroundShapeType,
  IllustrationNameType,
} from './ErrorIllustration/ErrorIllustration';

export interface ErrorMessageProps {
  readonly action: 'button' | 'link';
  readonly align: 'start' | 'center';
  readonly size?: 'small';
  readonly illustration?: IllustrationNameType;
  readonly backgroundShape?: BackgroundShapeType;
  readonly headingLevel?: '1' | '2' | '3' | '4' | '5' | '6';
  readonly title: string;
  readonly description: string;
  readonly actionText: string;
}
