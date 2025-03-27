import { Heading, Icon, IconProps, BodyShort } from '@pxweb2/pxweb2-ui';

export interface InformationCardProps extends React.HTMLAttributes<HTMLHeadingElement> {
  //readonly heading: string;
  readonly icon: IconProps['iconName'];
  readonly type?: 'text' | 'boolean';
  readonly value?: string | boolean;
  //readonly children?: ContentDetails[];


  heading?: string;

  headingSize?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  headingLevel?: '1' | '2' | '3' | '4' | '5' | '6';
  align?: 'start' | 'center' | 'end';
  textcolor?: 'default' | 'subtle';
  spacing?: boolean;
  children: string | React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function InformationCard({heading, headingSize, headingLevel, children } : InformationCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 ">
      <Icon iconName="Book" className="text-primary-500 mb-4" />
      <Heading size={headingSize} level={headingLevel} className="mb-4">
        {heading}
      </Heading>
      {children}
    </div>
  );
}
