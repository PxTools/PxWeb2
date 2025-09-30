import {
  BackgroundShapeType,
  IllustrationNameType,
} from './ErrorIllustration/ErrorIllustration';

export interface ErrorMessageProps {
  readonly action: 'button' | 'link';
  readonly align: 'start' | 'center';
  readonly illustration?: IllustrationNameType;
  readonly backgroundShape?: BackgroundShapeType;
  readonly title: string;
  readonly description: string;
  readonly actionText: string;
}
