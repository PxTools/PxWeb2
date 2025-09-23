import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorMessage } from './ErrorMessage';

// Mock the UI components
vi.mock('@pxweb2/pxweb2-ui', () => ({
  Heading: ({
    children,
    level,
    size,
    align,
  }: {
    children: React.ReactNode;
    level: string;
    size: string;
    align: string;
  }) => (
    <div
      data-testid="heading"
      data-level={level}
      data-size={size}
      data-align={align}
    >
      {children}
    </div>
  ),
  Ingress: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="ingress" className={className}>
      {children}
    </div>
  ),
}));

// Mock the child components
vi.mock('./ErrorAction/ErrorAction', () => ({
  ErrorAction: ({
    action,
    actionText,
    align,
  }: {
    action: string;
    actionText: string;
    align: string;
  }) => (
    <div data-testid="error-action" data-action={action} data-align={align}>
      {actionText}
    </div>
  ),
}));
vi.mock('./ErrorIllustration/ErrorIllustration', () => ({
  ErrorIllustration: ({
    backgroundShape,
    illustrationName,
  }: {
    backgroundShape: string;
    illustrationName: string;
  }) => (
    <div
      data-testid="error-illustration"
      data-background-shape={backgroundShape}
      data-illustration-name={illustrationName}
    />
  ),
}));

describe('ErrorMessage', () => {
  const defaultProps = {
    action: 'button' as const,
    align: 'center' as const,
    illustration: 'NotFound' as const,
    title: 'Test error title',
    description: 'Test error description',
    actionText: 'Retry',
  };

  it('should render with required props', () => {
    render(<ErrorMessage {...defaultProps} />);

    expect(screen.getByText('Test error title')).toBeInTheDocument();
    expect(screen.getByText('Test error description')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should render with default illustration GenericError when not provided', () => {
    const propsWithoutIllustration = {
      ...defaultProps,
      illustration: undefined,
    };

    render(<ErrorMessage {...propsWithoutIllustration} />);

    const illustration = screen.getByTestId('error-illustration');

    expect(illustration).toHaveAttribute(
      'data-illustration-name',
      'GenericError',
    );
  });

  it('should render with custom illustration when provided', () => {
    render(<ErrorMessage {...defaultProps} illustration="NotFound" />);

    const illustration = screen.getByTestId('error-illustration');

    expect(illustration).toHaveAttribute('data-illustration-name', 'NotFound');
  });

  it('should render with default backgroundShape circle when not provided', () => {
    render(<ErrorMessage {...defaultProps} />);

    const illustration = screen.getByTestId('error-illustration');

    expect(illustration).toHaveAttribute('data-background-shape', 'circle');
  });

  it('should render with custom backgroundShape when provided', () => {
    render(<ErrorMessage {...defaultProps} backgroundShape="wavy" />);

    const illustration = screen.getByTestId('error-illustration');

    expect(illustration).toHaveAttribute('data-background-shape', 'wavy');
  });

  it('should apply center alignment correctly', () => {
    render(<ErrorMessage {...defaultProps} align="center" />);

    const heading = screen.getByTestId('heading');
    const errorAction = screen.getByTestId('error-action');

    expect(heading).toHaveAttribute('data-align', 'center');
    expect(errorAction).toHaveAttribute('data-align', 'center');
  });

  it('should apply start alignment correctly', () => {
    render(<ErrorMessage {...defaultProps} align="start" />);

    const heading = screen.getByTestId('heading');
    const errorAction = screen.getByTestId('error-action');

    expect(heading).toHaveAttribute('data-align', 'start');
    expect(errorAction).toHaveAttribute('data-align', 'start');
  });

  it('should pass button action to ErrorAction', () => {
    render(<ErrorMessage {...defaultProps} action="button" />);

    const errorAction = screen.getByTestId('error-action');

    expect(errorAction).toHaveAttribute('data-action', 'button');
  });

  it('should pass link action to ErrorAction', () => {
    render(<ErrorMessage {...defaultProps} action="link" />);

    const errorAction = screen.getByTestId('error-action');

    expect(errorAction).toHaveAttribute('data-action', 'link');
  });

  it('should render heading with correct props', () => {
    render(<ErrorMessage {...defaultProps} />);

    const heading = screen.getByTestId('heading');

    expect(heading).toHaveAttribute('data-level', '1');
    expect(heading).toHaveAttribute('data-size', 'large');
    expect(heading).toHaveTextContent('Test error title');
  });

  it('should pass illustration name to ErrorIllustration', () => {
    render(<ErrorMessage {...defaultProps} illustration="NotFound" />);

    const illustration = screen.getByTestId('error-illustration');

    expect(illustration).toHaveAttribute('data-illustration-name', 'NotFound');
  });

  it('should render all required elements in the DOM', () => {
    render(<ErrorMessage {...defaultProps} />);

    expect(screen.getByTestId('error-illustration')).toBeInTheDocument();
    expect(screen.getByTestId('heading')).toBeInTheDocument();
    expect(screen.getAllByTestId('ingress')).toHaveLength(2); // One for description, one wrapping the action
    expect(screen.getByTestId('error-action')).toBeInTheDocument();
  });
});
