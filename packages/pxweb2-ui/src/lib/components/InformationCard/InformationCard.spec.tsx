import { mockHTMLDialogElement } from '../../util/test-utils';
import { InformationCard } from './InformationCard';
import { render, screen } from '@testing-library/react';

describe('InformationCard', () => {
  beforeEach(() => {
    mockHTMLDialogElement();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <InformationCard headingText="test" icon="Book">
        <span>test</span>
      </InformationCard>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render a heading element when headingText is provided', () => {
    render(
      <InformationCard headingText="Sample Heading" icon="Book">
        <span>test</span>
      </InformationCard>,
    );
    const heading = screen.getByRole('heading', { name: /sample heading/i });
    expect(heading).not.toBeNull();
  });
});
