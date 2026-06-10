import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';

import { ApiQuery } from './ApiQuery';
import styles from './ApiQuery.module.scss';

const { useApiQueryInfoMock } = vi.hoisted(() => ({
  useApiQueryInfoMock: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key === 'presentation_page.side_menu.save.api.link_url'
        ? 'https://docs.example.com/api'
        : key,
  }),
}));

vi.mock('../../../i18n/config', () => ({
  default: {
    language: 'en',
  },
}));

vi.mock('../../util/apiQuery/apiQueryUtil', () => ({
  useApiQueryInfo: useApiQueryInfoMock,
}));

vi.mock('@pxweb2/pxweb2-ui', async (importOriginal) => {
  const original = await importOriginal<typeof import('@pxweb2/pxweb2-ui')>();

  const Chips = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );

  Chips.Toggle = ({
    children,
    onClick,
    selected,
  }: {
    children: ReactNode;
    onClick?: () => void;
    selected?: boolean;
  }) => (
    <button onClick={onClick} aria-pressed={selected}>
      {children}
    </button>
  );

  return {
    ...original,
    BodyLong: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Link: ({ children, href }: { children: ReactNode; href?: string }) => (
      <a href={href}>{children}</a>
    ),
    Chips,
    CodeSnippet: ({
      title,
      children,
    }: {
      title: string;
      children: ReactNode;
    }) => (
      <section>
        <h3>{title}</h3>
        <pre>{children}</pre>
      </section>
    ),
    Select: ({
      className,
      label,
      selectedOption,
      onChange,
      options,
    }: {
      className?: string;
      label: string;
      selectedOption?: { value: string; label: string };
      onChange?: (option: { value: string; label: string } | undefined) => void;
      options: Array<{ value: string; label: string }>;
    }) => (
      <div>
        <label htmlFor="api-query-format-select">{label}</label>
        <select
          id="api-query-format-select"
          data-testid="api-query-select"
          className={className}
          value={selectedOption?.value ?? ''}
          onChange={(event) => {
            const option = options.find(
              (currentOption) => currentOption.value === event.target.value,
            );
            onChange?.(option);
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    ),
  };
});

describe('ApiQuery', () => {
  beforeEach(() => {
    useApiQueryInfoMock.mockImplementation(
      (language: string, selectedFormat: string) => ({
        getUrl: `https://example.test/get?lang=${language}&format=${selectedFormat}`,
        postUrl: `https://example.test/post?lang=${language}&format=${selectedFormat}`,
        postBody: JSON.stringify({ format: selectedFormat }),
      }),
    );
  });

  it('renders default GET view with description, link and select options', () => {
    render(<ApiQuery />);

    expect(
      screen.getByText('presentation_page.side_menu.save.api.description'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'presentation_page.side_menu.save.api.link_text',
      }),
    ).toHaveAttribute('href', 'https://docs.example.com/api');

    const select = screen.getByTestId('api-query-select');
    expect(select).toHaveValue('jsonstat2');
    expect(screen.getAllByRole('option')).toHaveLength(5);

    expect(screen.getByText('GET URL')).toBeInTheDocument();
    expect(
      screen.getByText('https://example.test/get?lang=en&format=jsonstat2'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('presentation_page.side_menu.save.api.post_body_text'),
    ).not.toBeInTheDocument();
  });

  it('passes select width override class to Select', () => {
    render(<ApiQuery />);

    expect(screen.getByTestId('api-query-select')).toHaveClass(
      styles.selectWidthOverride,
    );
  });

  it('switches to POST and renders post URL and body snippet', () => {
    render(<ApiQuery />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'presentation_page.side_menu.save.api.post_button_text',
      }),
    );

    expect(screen.getByText('POST URL')).toBeInTheDocument();
    expect(
      screen.getByText('https://example.test/post?lang=en&format=jsonstat2'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('presentation_page.side_menu.save.api.post_body_text'),
    ).toBeInTheDocument();
    expect(screen.getByText('{"format":"jsonstat2"}')).toBeInTheDocument();
  });

  it('updates selected format and recomputes query info', () => {
    render(<ApiQuery />);

    fireEvent.change(screen.getByTestId('api-query-select'), {
      target: { value: 'csv' },
    });

    expect(useApiQueryInfoMock).toHaveBeenLastCalledWith('en', 'csv');
    expect(
      screen.getByText('https://example.test/get?lang=en&format=csv'),
    ).toBeInTheDocument();
  });
});
