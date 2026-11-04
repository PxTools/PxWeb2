import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ManualPivot } from './ManualPivoting';
import { VartypeEnum, type Variable } from '@pxweb2/pxweb2-ui';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock('motion/react', async () => {
  const React = await import('react');

  const Group = ({
    as,
    className,
    children,
  }: {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
  }) => {
    const Element = as ?? 'div';
    return <Element className={className}>{children}</Element>;
  };

  const Item = React.forwardRef<
    HTMLLIElement,
    {
      as?: React.ElementType;
      children: React.ReactNode;
      drag?: boolean;
      dragMomentum?: boolean;
      dragElastic?: number;
      whileDrag?: unknown;
    }
  >(
    (
      { as, children, drag, dragMomentum, dragElastic, whileDrag, ...props },
      ref,
    ) => {
      void drag;
      void dragMomentum;
      void dragElastic;
      void whileDrag;
      const Element = as ?? 'div';
      return (
        <Element ref={ref} {...props}>
          {children}
        </Element>
      );
    },
  );
  Item.displayName = 'ReorderItem';

  return {
    Reorder: {
      Group,
      Item,
    },
  };
});

vi.mock('@pxweb2/pxweb2-ui', async () => {
  return {
    VartypeEnum: {
      REGULAR_VARIABLE: 'RegularVariable',
    },
    Modal: ({
      isOpen,
      onClose,
      confirmLabel,
      cancelLabel,
      children,
    }: {
      isOpen: boolean;
      onClose?: (updated: boolean, keyPress?: ' ' | 'Enter' | 'Escape') => void;
      confirmLabel?: string;
      cancelLabel?: string;
      children: React.ReactNode;
    }) =>
      isOpen ? (
        <div data-testid="modal">
          <button
            type="button"
            onClick={() => onClose?.(true)}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={() => onClose?.(false)}
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          {children}
        </div>
      ) : null,
    Label: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    InformationCard: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    BodyLong: ({ children }: { children: React.ReactNode }) => (
      <p>{children}</p>
    ),
    Icon: ({ iconName }: { iconName: string }) => <span>{iconName}</span>,
  };
});

const makeVariable = (id: string, label: string): Variable => ({
  id,
  label,
  type: VartypeEnum.REGULAR_VARIABLE,
  mandatory: false,
  values: [],
});

const getItem = (id: string): HTMLLIElement => {
  const item = document.querySelector(`[data-variable-id="${id}"]`);
  expect(item).toBeInTheDocument();
  return item as HTMLLIElement;
};

const setRect = (element: Element, rect: DOMRect) => {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect);
};

const makeRect = (
  left: number,
  top: number,
  right: number,
  bottom: number,
): DOMRect => ({
  left,
  top,
  right,
  bottom,
  width: right - left,
  height: bottom - top,
  x: left,
  y: top,
  toJSON: () => ({}),
});

const confirmPivot = () => {
  fireEvent.click(
    screen.getByRole('button', {
      name: 'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.confirm_button',
    }),
  );
};

describe('ManualPivoting', () => {
  it('allows dropping into a shorter group below its last item', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
          makeVariable('s3', 'Stub 3'),
        ]}
      />,
    );

    const zones = document.querySelectorAll('ul');
    const stubZone = zones[0]?.parentElement;
    const headerZone = zones[1]?.parentElement;
    expect(stubZone).not.toBeNull();
    expect(headerZone).not.toBeNull();

    setRect(stubZone!, makeRect(0, 100, 100, 250));
    setRect(headerZone!, makeRect(120, 100, 220, 140));
    setRect(getItem('s1'), makeRect(0, 100, 100, 140));
    setRect(getItem('h1'), makeRect(120, 100, 220, 140));

    fireEvent.dragStart(getItem('s1'));
    fireEvent(
      getItem('s1'),
      new MouseEvent('drag', {
        bubbles: true,
        clientX: 170,
        clientY: 225,
      }),
    );
    fireEvent(
      getItem('s1'),
      new MouseEvent('dragend', {
        bubbles: true,
        clientX: 170,
        clientY: 225,
      }),
    );
    confirmPivot();

    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['h1', 's1']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s2', 's3']);
  });

  it('allows dropping at the end of a multi-item group below the taller list', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[
          makeVariable('h1', 'Header 1'),
          makeVariable('h2', 'Header 2'),
        ]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
          makeVariable('s3', 'Stub 3'),
        ]}
      />,
    );

    const zones = document.querySelectorAll('ul');
    const stubZone = zones[0]?.parentElement;
    const headerZone = zones[1]?.parentElement;
    expect(stubZone).not.toBeNull();
    expect(headerZone).not.toBeNull();

    setRect(stubZone!, makeRect(0, 100, 100, 250));
    setRect(headerZone!, makeRect(120, 100, 220, 190));
    setRect(getItem('s1'), makeRect(0, 100, 100, 140));
    setRect(getItem('h1'), makeRect(120, 100, 220, 140));
    setRect(getItem('h2'), makeRect(120, 146, 220, 186));

    fireEvent.dragStart(getItem('s1'));
    fireEvent(
      getItem('s1'),
      new MouseEvent('drag', {
        bubbles: true,
        clientX: 170,
        clientY: 330,
      }),
    );
    fireEvent(
      getItem('s1'),
      new MouseEvent('dragend', {
        bubbles: true,
        clientX: 170,
        clientY: 330,
      }),
    );
    confirmPivot();

    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual([
      'h1',
      'h2',
      's1',
    ]);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s2', 's3']);
  });

  it('calls onClose with updated=true and reordered lists on confirm', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const draggedItem = getItem('s2');

    fireEvent.keyDown(draggedItem, { key: ' ' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowRight' });
    fireEvent.keyDown(getItem('s2'), { key: 'Enter' });

    confirmPivot();

    expect(onClose).toHaveBeenCalledTimes(1);
    const [updated, headerItems, stubItems] = onClose.mock.calls[0];

    expect(updated).toBe(true);
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['h1', 's2']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1']);
  });

  it('calls onClose with updated=false on cancel', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[makeVariable('s1', 'Stub 1')]}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.cancel_button',
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    const [updated] = onClose.mock.calls[0];
    expect(updated).toBe(false);
  });

  it('reorders items within the same group with the keyboard', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
          makeVariable('s3', 'Stub 3'),
        ]}
      />,
    );

    const draggedItem = getItem('s1');
    fireEvent.keyDown(draggedItem, { key: ' ' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowDown' });
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    confirmPivot();

    const [, , stubItems] = onClose.mock.calls[0];
    expect(stubItems.map((item: Variable) => item.id)).toEqual([
      's2',
      's1',
      's3',
    ]);
  });

  it('moves an item from the header group to the stub group', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[
          makeVariable('h1', 'Header 1'),
          makeVariable('h2', 'Header 2'),
        ]}
        stubVariables={[makeVariable('s1', 'Stub 1')]}
      />,
    );

    const draggedItem = getItem('h2');
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowLeft' });
    fireEvent.keyDown(getItem('h2'), { key: 'Enter' });
    confirmPivot();

    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['h1']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1', 'h2']);
  });

  it('moves an item from the stub group to the header group', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const draggedItem = getItem('s1');
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowRight' });
    fireEvent.keyDown(getItem('s1'), { key: 'Enter' });
    confirmPivot();

    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['s1', 'h1']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s2']);
  });

  it('restores the original order when keyboard movement is cancelled', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const draggedItem = getItem('s1');
    fireEvent.keyDown(draggedItem, { key: ' ' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowDown' });
    fireEvent.keyDown(draggedItem, { key: 'Escape' });
    confirmPivot();

    const [, , stubItems] = onClose.mock.calls[0];
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1', 's2']);
  });

  it('does not move an item past the group boundary', () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const draggedItem = getItem('s1');
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    fireEvent.keyDown(draggedItem, { key: 'ArrowUp' });
    fireEvent.keyDown(draggedItem, { key: 'Enter' });
    confirmPivot();

    const [, , stubItems] = onClose.mock.calls[0];
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1', 's2']);
  });

  it('uses updated variables when reopened with new props', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[makeVariable('s1', 'Stub 1')]}
      />,
    );

    rerender(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h2', 'Header 2')]}
        stubVariables={[makeVariable('s2', 'Stub 2')]}
      />,
    );
    confirmPivot();

    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['h2']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s2']);
  });

  it('keeps keyboard focus on the item after dropping it', async () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[makeVariable('s1', 'Stub 1')]}
      />,
    );

    const firstItem = getItem('s1');
    firstItem.focus();
    fireEvent.keyDown(firstItem, { key: 'Enter' });
    fireEvent.keyDown(firstItem, { key: 'ArrowRight' });
    fireEvent.keyDown(getItem('s1'), { key: 'Enter' });

    await waitFor(() => {
      expect(document.activeElement).toBe(getItem('s1'));
    });

    const secondItem = document.activeElement as HTMLLIElement;
    expect(secondItem).toBe(getItem('s1'));
    fireEvent.keyDown(secondItem, { key: 'Enter' });
    await waitFor(() => {
      expect(getItem('s1')).toHaveAttribute('aria-grabbed', 'true');
    });
    fireEvent.keyDown(secondItem, { key: 'ArrowLeft' });
    fireEvent.keyDown(secondItem, { key: 'Enter' });
    confirmPivot();

    expect(onClose).toHaveBeenCalledTimes(1);
    const [, headerItems, stubItems] = onClose.mock.calls[0];
    expect(headerItems.map((item: Variable) => item.id)).toEqual(['h1']);
    expect(stubItems.map((item: Variable) => item.id)).toEqual(['s1']);
  });

  it('allows a different item to be grabbed after the first item is dropped', async () => {
    const onClose = vi.fn();

    render(
      <ManualPivot
        isOpen={true}
        onClose={onClose}
        headerVariables={[makeVariable('h1', 'Header 1')]}
        stubVariables={[
          makeVariable('s1', 'Stub 1'),
          makeVariable('s2', 'Stub 2'),
        ]}
      />,
    );

    const firstItem = getItem('s1');
    firstItem.focus();
    fireEvent.keyDown(firstItem, { key: 'Enter' });
    fireEvent.keyDown(firstItem, { key: 'ArrowRight' });
    fireEvent.keyDown(getItem('s1'), { key: 'Enter' });

    await waitFor(() => {
      expect(document.activeElement).toBe(getItem('s1'));
    });

    const secondItem = getItem('s2');
    secondItem.focus();
    fireEvent.keyDown(secondItem, { key: 'Enter' });

    await waitFor(() => {
      expect(getItem('s2')).toHaveAttribute('aria-grabbed', 'true');
    });
  });
});
