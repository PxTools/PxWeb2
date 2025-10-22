import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import Chips from './Chips';
import classes from './Chips.module.scss';

describe('Chips', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Chips>Test Chips</Chips>);
    expect(baseElement).toBeTruthy();
  });

  it('should render children', () => {
    render(
      <Chips>
        <Chips.Toggle>Toggle Chip</Chips.Toggle>
        <Chips.Removable>Removable Chip</Chips.Removable>
      </Chips>,
    );
    expect(screen.getByText('Toggle Chip')).toBeInTheDocument();
    expect(screen.getByText('Removable Chip')).toBeInTheDocument();
  });

  it('should apply className from styles', () => {
    render(<Chips>Test Chips</Chips>);
    const ulElement = screen.getByRole('list');
    expect(ulElement).toHaveClass(classes.chips);
  });

  it('should render children inside <li> elements', () => {
    render(
      <Chips>
        <Chips.Toggle>Toggle Chip</Chips.Toggle>
        <Chips.Removable>Removable Chip</Chips.Removable>
      </Chips>,
    );
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toContainElement(screen.getByText('Toggle Chip'));
    expect(listItems[1]).toContainElement(screen.getByText('Removable Chip'));
  });
});

describe('ChipToggle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Chips.Toggle>Test Removable Chip</Chips.Toggle>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render children text', () => {
    render(<Chips.Toggle>Test Chip</Chips.Toggle>);
    expect(screen.getByText('Test Chip')).toBeInTheDocument();
  });

  it('should apply selected class when selected is true', () => {
    render(<Chips.Toggle selected>Selected Chip</Chips.Toggle>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(classes.selected);
  });

  it('should not apply selected class when selected is false', () => {
    render(<Chips.Toggle>Unselected Chip</Chips.Toggle>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass(classes.selected);
  });

  it('should render checkmark icon when selected and checkmark are true', () => {
    render(
      <Chips.Toggle selected checkmark>
        Checkmark Chip
      </Chips.Toggle>,
    );
    const button = screen.getByRole('button');
    const svgElement = button.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('should not render checkmark icon when checkmark is false', () => {
    render(
      <Chips.Toggle selected={true} checkmark={false}>
        No Checkmark Chip
      </Chips.Toggle>,
    );
    const button = screen.getByRole('button');
    const svgElement = button.querySelector('svg');
    expect(svgElement).not.toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    let clickCount = 0;
    const handleClick = () => {
      clickCount += 1;
    };
    render(<Chips.Toggle onClick={handleClick}>Clickable Chip</Chips.Toggle>);
    fireEvent.click(screen.getByRole('button'));
    expect(clickCount).toBe(1);
  });
});

describe('ChipRemovable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Chips.Removable>Test Removable Chip</Chips.Removable>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render children text', () => {
    render(<Chips.Removable>Test Removable Chip</Chips.Removable>);
    expect(screen.getByText('Test Removable Chip')).toBeInTheDocument();
  });

  it('should apply filled class when filled is true', () => {
    render(<Chips.Removable filled>Filled Chip</Chips.Removable>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(classes.filled);
  });

  it('should apply truncate class when truncate is true', () => {
    render(<Chips.Removable truncate>Truncate Chip</Chips.Removable>);
    const span = screen.getByText('Truncate Chip');
    expect(span).toHaveClass(classes.truncate);
  });

  it('should set title attribute when truncate is true', () => {
    render(<Chips.Removable truncate>Truncate Chip</Chips.Removable>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Truncate Chip');
  });

  it('should render XMark icon', () => {
    render(<Chips.Removable>XMark Chip</Chips.Removable>);
    const button = screen.getByRole('button');
    const svgElement = button.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    let clickCount = 0;
    const handleClick = () => {
      clickCount += 1;
    };
    render(
      <Chips.Removable onClick={handleClick}>Clickable Chip</Chips.Removable>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(clickCount).toBe(1);
  });
});
