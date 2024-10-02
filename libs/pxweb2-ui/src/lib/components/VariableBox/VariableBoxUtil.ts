import { Value } from '../../shared-types/value';

function getContainerHeight(text: string): number {
  // Create a hidden div element
  const div = document.createElement('div');

  // Apply the necessary styles
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.width = `262px`;
  div.style.fontSize = `16px`;
  div.style.fontFamily = 'PxWeb-font-400';
  div.style.lineHeight = `24px`;
  div.style.whiteSpace = 'normal'; // Ensure text wraps
  div.style.wordWrap = 'break-word'; // Handle long words

  div.textContent = text;

  document.body.appendChild(div);

  const totalHeight = div.clientHeight;

  document.body.removeChild(div);

  return totalHeight;
}

// Function to get the size of each item
export const getItemSize = (
  items: { type: string; value?: Value }[],
  index: number
) => {
  if (!items || index < 0 || index >= items.length) {
    return 0;
  }

  const item = items[index];

  if (!item) {
    return 0;
  }

  if (item.type === 'search') {
    return 48; // Height of the Search component
  }
  if (item.type === 'mixedCheckbox') {
    return 44; // Height of the MixedCheckbox component
  }

  if (item.type === 'value') {
    if (!items[index] || !items[index].value) {
      return 44;
    }
    return getContainerHeight(
      items[index].value.label.charAt(0).toUpperCase() +
        items[index].value.label.slice(1)
    );
  }
  return 44;
};
