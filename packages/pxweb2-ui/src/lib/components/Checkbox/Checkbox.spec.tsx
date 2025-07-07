import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import Checkbox, { MixedCheckbox, MixedValue } from './Checkbox';

describe('Checkboxes', () => {
  describe('Checkbox', () => {
    it('should render successfully', () => {
      const { baseElement } = render(
        <Checkbox
          id="test"
          text="Variable 1"
          onChange={(val) => {
            console.log(val);
          }}
          value={true}
        />,
      );

      expect(baseElement).toBeTruthy();
    });

    it('should check the checkbox', () => {
      let selected = false;
      const { baseElement } = render(
        <Checkbox
          id="test"
          text="Variable 1"
          onChange={(val) => {
            selected = val;
          }}
          value={selected}
        />,
      );

      (baseElement.querySelector('#test') as HTMLElement)?.click();

      expect(selected).toBe(true);
    });

    it('should toggle the checkbox', () => {
      let selected = false;
      const { getByRole, rerender } = render(
        <Checkbox
          id="test"
          text="Variable 1"
          onChange={(val) => {
            selected = val;
          }}
          value={selected}
        />,
      );

      fireEvent.click(getByRole('checkbox'));

      expect(selected).toBe(true);

      // Re-render with the updated value
      rerender(
        <Checkbox
          id="test"
          text="Variable 1"
          onChange={(val) => {
            selected = val;
          }}
          value={selected}
        />,
      );

      fireEvent.click(getByRole('checkbox'));

      expect(selected).toBe(false);
    });

    it('should not be clickable when subtle is true', () => {
      const onChangeMock = {
        called: false,
        fn: function () {
          this.called = true;
        },
      };
      const { getByRole } = render(
        <Checkbox
          id="test"
          text="Variable 1"
          value={false}
          subtle={true}
          onChange={onChangeMock.fn.bind(onChangeMock)}
        />,
      );

      fireEvent.click(getByRole('checkbox'));

      expect(onChangeMock.called).toBe(false);
    });
  });

  describe('MixedCheckbox', () => {
    it('should render successfully', () => {
      const { baseElement } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value="false"
          onChange={() => {}}
          ariaControls={['item1', 'item2']}
        />,
      );

      expect(baseElement).toBeTruthy();
    });

    it('should change from false to true when clicked', () => {
      let value: MixedValue = 'false';
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value={value}
          onChange={(val) => {
            value = val;
          }}
          ariaControls={['item1', 'item2']}
        />,
      );

      fireEvent.click(getByRole('checkbox'));

      expect(value).toBe('true');
    });

    it('should change from true to false when clicked', () => {
      let value: MixedValue = 'true';
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value={value}
          onChange={(val) => {
            value = val;
          }}
          ariaControls={['item1', 'item2']}
        />,
      );

      fireEvent.click(getByRole('checkbox'));

      expect(value).toBe('false');
    });

    it('should change from mixed to false when clicked', () => {
      let value: MixedValue = 'mixed';
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value={value}
          onChange={(val) => {
            value = val;
          }}
          ariaControls={['item1', 'item2']}
        />,
      );

      fireEvent.click(getByRole('checkbox'));

      expect(value).toBe('false');
    });

    it('should handle space key press when value is false', () => {
      let value: MixedValue = 'false';
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value={value}
          onChange={(val) => {
            value = val;
          }}
          ariaControls={['item1', 'item2']}
        />,
      );

      fireEvent.keyUp(getByRole('checkbox'), { key: ' ' });

      expect(value).toBe('true');
    });

    it('should handle space key press when value is true', () => {
      let value: MixedValue = 'true';
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value={value}
          onChange={(val) => {
            value = val;
          }}
          ariaControls={['item1', 'item2']}
        />,
      );

      fireEvent.keyUp(getByRole('checkbox'), { key: ' ' });

      expect(value).toBe('false');
    });

    it('should handle space key press when value is mixed', () => {
      let value: MixedValue = 'mixed';
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value={value}
          onChange={(val) => {
            value = val;
          }}
          ariaControls={['item1', 'item2']}
        />,
      );

      fireEvent.keyUp(getByRole('checkbox'), { key: ' ' });

      expect(value).toBe('false');
    });

    it('should prevent default on space key down', () => {
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value="false"
          onChange={() => {}}
          ariaControls={['item1', 'item2']}
        />,
      );

      const checkbox = getByRole('checkbox');
      const result = fireEvent.keyDown(checkbox, { key: ' ' });

      // If preventDefault was called, fireEvent returns false
      expect(result).toBe(false);
    });

    it('should apply inVariableBox class when specified', () => {
      const { container } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value="false"
          onChange={() => {}}
          ariaControls={['item1', 'item2']}
          inVariableBox={true}
        />,
      );

      const checkboxWrapper = container.firstChild as Element;

      expect(checkboxWrapper).toBeTruthy();
      expect(checkboxWrapper.className).toMatch(/inVariableBox/);
    });

    it('should set tabIndex when provided', () => {
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value="false"
          onChange={() => {}}
          ariaControls={['item1', 'item2']}
          tabIndex={2}
        />,
      );

      expect(getByRole('checkbox')).toHaveAttribute('tabIndex', '2');
    });

    it('should apply strong style when specified', () => {
      const { container } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value="false"
          onChange={() => {}}
          ariaControls={['item1', 'item2']}
          strong={true}
        />,
      );

      const label = container.querySelector(`[id="test-mixed-label"]`);

      expect(label).toBeTruthy();
      expect(label?.className).toMatch(/strong/);
    });

    it('should apply no margin style when specified', () => {
      const { container } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value="false"
          onChange={() => {}}
          ariaControls={['item1', 'item2']}
          noMargin={true}
        />,
      );

      const checkmark = container.querySelector(`[class*="checkmark"]`);

      expect(checkmark).toBeTruthy();
      expect(checkmark?.className).toMatch(/checkmarkWithoutMargin/);
    });

    it('should set correct aria attributes', () => {
      const { getByRole } = render(
        <MixedCheckbox
          id="test-mixed"
          text="Select All"
          value="true"
          onChange={() => {}}
          ariaControls={['item1', 'item2']}
        />,
      );

      const checkbox = getByRole('checkbox');

      expect(checkbox.getAttribute('aria-checked')).toBe('true');
      expect(checkbox.getAttribute('aria-labelledby')).toBe('test-mixed-label');
      expect(checkbox.getAttribute('aria-controls')).toBe('item1 item2');
    });
  });
});
