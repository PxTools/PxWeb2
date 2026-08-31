import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Reorder, type PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import {
  Modal,
  Variable,
  Label,
  InformationCard,
  BodyLong,
} from '@pxweb2/pxweb2-ui';
import classes from './ManualPivoting.module.scss';
import DataItem from './DataItem';
import DropTarget from './DropTarget';
import EmtyList from './EmtyList';

type VariableGroup = 'header' | 'stub';
type DropPreview = {
  group: VariableGroup;
  index: number;
  height: number;
} | null;
type KeyboardDragSnapshot = {
  headerItems: Variable[];
  stubItems: Variable[];
};
type PointerDragSnapshot = {
  itemId: string;
  sourceGroup: VariableGroup;
  sourceIndex: number;
  sourceLabel: string;
  sourceHeight: number;
};
type SourcePlaceholderMeta = {
  group: VariableGroup;
  height: number;
} | null;

interface ManualPivotProps {
  readonly isOpen: boolean;
  readonly onClose: (
    updated: boolean,
    headerItems: Variable[],
    stubItems: Variable[],
  ) => void;
  readonly headerVariables: Variable[];
  readonly stubVariables: Variable[];
}

/** Renders the modal used to manually reorder variables between table groups. */
export function ManualPivot({
  isOpen,
  onClose,
  headerVariables,
  stubVariables,
}: ManualPivotProps) {
  const { t } = useTranslation();
  const keyboardInstructionsId = useId();
  const [headerItems, setHeaderItems] = useState<Variable[]>(headerVariables);
  const [stubItems, setStubItems] = useState<Variable[]>(stubVariables);
  const [keyboardDraggedItemId, setKeyboardDraggedItemId] = useState<
    string | null
  >(null);
  const keyboardDraggedItemIdRef = useRef<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const headerItemsRef = useRef<Variable[]>(headerVariables);
  const stubItemsRef = useRef<Variable[]>(stubVariables);
  const headerZoneRef = useRef<HTMLDivElement | null>(null);
  const stubZoneRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const pendingFocusItemIdRef = useRef<string | null>(null);
  const keyboardDragSnapshotRef = useRef<KeyboardDragSnapshot | null>(null);
  const draggedItemIdRef = useRef<string | null>(null);
  const dragSourceGroupRef = useRef<VariableGroup | null>(null);
  const hoveredGroupRef = useRef<VariableGroup | null>(null);
  const isDraggingRef = useRef(false);
  const lastPointerYRef = useRef<number | null>(null);
  const dropPreviewRef = useRef<DropPreview>(null);
  const pointerDragSnapshotRef = useRef<PointerDragSnapshot | null>(null);
  const [dropPreview, setDropPreview] = useState<DropPreview>(null);
  const [sourcePlaceholderMeta, setSourcePlaceholderMeta] =
    useState<SourcePlaceholderMeta>(null);

  /** Restores the local lists and drag state whenever the modal is opened. */
  useEffect(() => {
    if (isOpen) {
      setHeaderItems(headerVariables);
      setStubItems(stubVariables);
      headerItemsRef.current = headerVariables;
      stubItemsRef.current = stubVariables;
      setKeyboardDraggedItemId(null);
      keyboardDraggedItemIdRef.current = null;
      setLiveAnnouncement('');
      keyboardDragSnapshotRef.current = null;
      pointerDragSnapshotRef.current = null;
      setSourcePlaceholderMeta(null);
    }
  }, [headerVariables, isOpen, stubVariables]);

  /** Moves focus to an item after a keyboard reorder has updated the lists. */
  useLayoutEffect(() => {
    const pendingItemId = pendingFocusItemIdRef.current;

    if (!pendingItemId) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      itemRefs.current.get(pendingItemId)?.focus();
    });

    pendingFocusItemIdRef.current = null;

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [headerItems, stubItems]);

  /** Synchronizes drag placeholder dimensions with the rendered drop zones. */
  useEffect(() => {
    /** Applies or removes a CSS custom property on a drop zone. */
    const applyZoneProperty = (
      zoneRef: React.RefObject<HTMLDivElement | null>,
      property: string,
      value: string | null,
    ) => {
      if (value) {
        zoneRef.current?.style.setProperty(property, value);
      } else {
        zoneRef.current?.style.removeProperty(property);
      }
    };

    applyZoneProperty(
      headerZoneRef,
      '--drop-preview-height',
      dropPreview?.group === 'header' ? `${dropPreview.height}px` : null,
    );
    applyZoneProperty(
      stubZoneRef,
      '--drop-preview-height',
      dropPreview?.group === 'stub' ? `${dropPreview.height}px` : null,
    );
    applyZoneProperty(
      headerZoneRef,
      '--source-placeholder-height',
      sourcePlaceholderMeta?.group === 'header'
        ? `${sourcePlaceholderMeta.height}px`
        : null,
    );
    applyZoneProperty(
      stubZoneRef,
      '--source-placeholder-height',
      sourcePlaceholderMeta?.group === 'stub'
        ? `${sourcePlaceholderMeta.height}px`
        : null,
    );
  }, [dropPreview, sourcePlaceholderMeta]);

  /** Updates both rendered lists and their refs used by drag callbacks. */
  const commitLists = (
    nextHeaderItems: Variable[],
    nextStubItems: Variable[],
  ) => {
    headerItemsRef.current = nextHeaderItems;
    stubItemsRef.current = nextStubItems;
    setHeaderItems(nextHeaderItems);
    setStubItems(nextStubItems);
  };

  /** Removes duplicate variables while preserving their first-seen order. */
  const dedupeById = (items: Variable[]): Variable[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  };

  /** Capitalizes the first character of a variable label for display. */
  const capitalizeLabel = (label: string): string =>
    label.charAt(0).toUpperCase() + label.slice(1);

  /** Returns the nearest drop zone containing or close to a pointer position. */
  const getGroupAtPoint = (x: number, y: number): VariableGroup | null => {
    const hitPadding = 20;
    const groupSwitchHysteresis = 14;
    /** Calculates the shortest distance from a point to a rectangle. */
    const distanceToRect = (rect: DOMRect): number => {
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      return Math.sqrt(dx * dx + dy * dy);
    };

    const headerRect = headerZoneRef.current?.getBoundingClientRect();
    const stubRect = stubZoneRef.current?.getBoundingClientRect();

    if (!headerRect && !stubRect) {
      return null;
    }

    const headerDistance = headerRect
      ? distanceToRect(headerRect)
      : Number.POSITIVE_INFINITY;
    const stubDistance = stubRect
      ? distanceToRect(stubRect)
      : Number.POSITIVE_INFINITY;
    const currentHoveredGroup = hoveredGroupRef.current;

    const nearestGroup = headerDistance <= stubDistance ? 'header' : 'stub';
    const nearestDistance = Math.min(headerDistance, stubDistance);

    if (currentHoveredGroup && currentHoveredGroup !== nearestGroup) {
      const currentDistance =
        currentHoveredGroup === 'header' ? headerDistance : stubDistance;

      // Keep the current group unless the new group is clearly closer.
      if (nearestDistance + groupSwitchHysteresis >= currentDistance) {
        if (currentDistance <= hitPadding) {
          return currentHoveredGroup;
        }
      }
    }

    if (nearestDistance <= hitPadding) {
      return nearestGroup;
    }

    return null;
  };

  /** Finds the insertion index indicated by the pointer's vertical position. */
  const getInsertIndexForElements = (
    itemElements: HTMLElement[],
    pointerY: number,
  ): number => {
    if (itemElements.length === 0) {
      return 0;
    }

    const index = itemElements.findIndex((element) => {
      const rect = element.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      return pointerY < midpoint;
    });

    return index === -1 ? itemElements.length : index;
  };

  /** Applies hysteresis so the drop preview does not flicker at item boundaries. */
  const getStableInsertIndex = (
    group: VariableGroup,
    rawIndex: number,
    itemElements: HTMLElement[],
    pointerY: number,
  ): number => {
    const previousPreview = dropPreviewRef.current;

    if (!previousPreview || previousPreview.group !== group) {
      return rawIndex;
    }

    const previousIndex = previousPreview.index;
    if (Math.abs(rawIndex - previousIndex) !== 1) {
      return rawIndex;
    }

    const hysteresisPx = 6;

    if (rawIndex === previousIndex + 1) {
      const transitionElement = itemElements[previousIndex];
      if (!transitionElement) {
        return rawIndex;
      }
      const rect = transitionElement.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      return pointerY <= midpoint + hysteresisPx ? previousIndex : rawIndex;
    }

    const transitionElement = itemElements[rawIndex];
    if (!transitionElement) {
      return rawIndex;
    }
    const rect = transitionElement.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    return pointerY >= midpoint - hysteresisPx ? previousIndex : rawIndex;
  };

  /** Builds a drop preview for a group while excluding the dragged item. */
  const getDropPreviewForGroup = (
    group: VariableGroup,
    pointerY: number,
    draggedItemId: string,
  ): DropPreview => {
    const zoneRef = group === 'header' ? headerZoneRef : stubZoneRef;
    const zoneElement = zoneRef.current;

    if (!zoneElement) {
      return null;
    }

    const itemElements = Array.from(
      zoneElement.querySelectorAll<HTMLElement>('[data-variable-id]'),
    ).filter((element) => element.dataset.variableId !== draggedItemId);
    const rawIndex = getInsertIndexForElements(itemElements, pointerY);
    const index = getStableInsertIndex(group, rawIndex, itemElements, pointerY);
    const defaultItemHeight = 40;

    if (itemElements.length === 0) {
      return { group, index: 0, height: defaultItemHeight };
    }

    const clampedIndex = Math.min(Math.max(0, index), itemElements.length);
    const referenceElement =
      clampedIndex >= itemElements.length
        ? itemElements[itemElements.length - 1]
        : itemElements[clampedIndex];
    const referenceHeight = Math.max(
      defaultItemHeight,
      Math.round(referenceElement.getBoundingClientRect().height),
    );

    return {
      group,
      index: clampedIndex,
      height: referenceHeight,
    };
  };

  /** Stores a changed drop preview and publishes it for rendering. */
  const updateDropPreview = (nextPreview: DropPreview) => {
    const currentPreview = dropPreviewRef.current;
    const isSamePreview =
      currentPreview?.group === nextPreview?.group &&
      currentPreview?.index === nextPreview?.index &&
      currentPreview?.height === nextPreview?.height;

    if (isSamePreview) {
      return;
    }

    dropPreviewRef.current = nextPreview;
    setDropPreview(nextPreview);
  };

  /** Inserts the active dragged item into a group at the requested index. */
  const moveDraggedItemToGroup = (
    targetGroup: VariableGroup,
    targetIndex: number,
  ) => {
    const draggedItemId = draggedItemIdRef.current;
    const sourceGroup = dragSourceGroupRef.current;

    if (!draggedItemId || !sourceGroup) {
      return;
    }

    const sourceItems =
      sourceGroup === 'header' ? headerItemsRef.current : stubItemsRef.current;
    const targetItems =
      targetGroup === 'header' ? headerItemsRef.current : stubItemsRef.current;
    const movingItem = sourceItems.find((item) => item.id === draggedItemId);

    if (!movingItem) {
      return;
    }

    if (sourceGroup === targetGroup) {
      const nextItems = sourceItems.filter((item) => item.id !== draggedItemId);
      const clampedInsertIndex = Math.min(
        Math.max(0, targetIndex),
        nextItems.length,
      );
      nextItems.splice(clampedInsertIndex, 0, movingItem);

      if (sourceGroup === 'header') {
        commitLists(nextItems, stubItemsRef.current);
      } else {
        commitLists(headerItemsRef.current, nextItems);
      }

      return;
    }

    const nextSourceItems = sourceItems.filter(
      (item) => item.id !== draggedItemId,
    );
    const nextTargetItems = targetItems.filter(
      (item) => item.id !== draggedItemId,
    );
    const clampedInsertIndex = Math.min(
      Math.max(0, targetIndex),
      nextTargetItems.length,
    );
    nextTargetItems.splice(clampedInsertIndex, 0, movingItem);

    if (sourceGroup === 'header') {
      commitLists(nextSourceItems, nextTargetItems);
    } else {
      commitLists(nextTargetItems, nextSourceItems);
    }

    dragSourceGroupRef.current = targetGroup;
  };

  /** Reads the current items belonging to a variable group. */
  const getItemsForGroup = (group: VariableGroup): Variable[] =>
    group === 'header' ? headerItemsRef.current : stubItemsRef.current;

  /** Finds a variable in either group by its identifier. */
  const getItemById = (itemId: string): Variable | undefined =>
    [...headerItemsRef.current, ...stubItemsRef.current].find(
      (item) => item.id === itemId,
    );

  /** Gets the translated visible label for a variable group. */
  const getGroupLabelText = (group: VariableGroup): string =>
    group === 'stub'
      ? t(
          'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.stub_title',
        )
      : t(
          'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.header_title',
        );

  /** Gets the translated label used in drag announcements. */
  const getGroupLabel = (group: VariableGroup): string =>
    getGroupLabelText(group);

  /** Announces the active item's current position. */
  const announceKeyboardMove = (itemId: string, group: VariableGroup) => {
    const groupItems = getItemsForGroup(group);
    const itemIndex = groupItems.findIndex((item) => item.id === itemId);
    const itemLabel = getItemById(itemId)?.label;
    const capitalizedItemLabel = itemLabel ? capitalizeLabel(itemLabel) : '';

    if (capitalizedItemLabel && itemIndex !== -1) {
      setLiveAnnouncement(
        `${capitalizedItemLabel} moved to position ${itemIndex + 1} in ${getGroupLabel(group)}.`,
      );
    }
  };

  /** Starts keyboard dragging for a variable and records its original lists. */
  const startKeyboardDrag = (group: VariableGroup, variableId: string) => {
    isDraggingRef.current = true;
    draggedItemIdRef.current = variableId;
    dragSourceGroupRef.current = group;
    hoveredGroupRef.current = group;
    keyboardDragSnapshotRef.current = {
      headerItems: [...headerItemsRef.current],
      stubItems: [...stubItemsRef.current],
    };
    setKeyboardDraggedItemId(variableId);
    keyboardDraggedItemIdRef.current = variableId;

    const itemLabel = getItemById(variableId)?.label;
    if (itemLabel) {
      const capitalizedItemLabel = capitalizeLabel(itemLabel);
      setLiveAnnouncement(
        `${capitalizedItemLabel} selected. Use arrow keys to move, Enter to drop, Escape to cancel.`,
      );
    }
  };

  /** Moves the keyboard-dragged item up or down within its current group. */
  const moveKeyboardDraggedItemWithinGroup = (direction: -1 | 1): boolean => {
    const draggedItemId = draggedItemIdRef.current;
    const sourceGroup = dragSourceGroupRef.current;

    if (!draggedItemId || !sourceGroup) {
      return false;
    }

    const sourceItems = getItemsForGroup(sourceGroup);
    const sourceIndex = sourceItems.findIndex(
      (item) => item.id === draggedItemId,
    );

    if (sourceIndex === -1) {
      return false;
    }

    const targetIndex = Math.min(
      Math.max(0, sourceIndex + direction),
      sourceItems.length - 1,
    );

    if (sourceIndex === targetIndex) {
      return false;
    }

    const nextSourceItems = [...sourceItems];
    const [movingItem] = nextSourceItems.splice(sourceIndex, 1);
    nextSourceItems.splice(targetIndex, 0, movingItem);

    pendingFocusItemIdRef.current = draggedItemId;

    if (sourceGroup === 'header') {
      commitLists(nextSourceItems, stubItemsRef.current);
    } else {
      commitLists(headerItemsRef.current, nextSourceItems);
    }

    announceKeyboardMove(draggedItemId, sourceGroup);

    return true;
  };

  /** Moves the keyboard-dragged item to the other group. */
  const moveKeyboardDraggedItemAcrossGroups = (
    targetGroup: VariableGroup,
  ): boolean => {
    const draggedItemId = draggedItemIdRef.current;
    const sourceGroup = dragSourceGroupRef.current;

    if (!draggedItemId || !sourceGroup || sourceGroup === targetGroup) {
      return false;
    }

    const sourceItems = getItemsForGroup(sourceGroup);
    const sourceIndex = sourceItems.findIndex(
      (item) => item.id === draggedItemId,
    );

    if (sourceIndex === -1) {
      return false;
    }

    const targetItems = getItemsForGroup(targetGroup);
    const targetIndex = Math.min(sourceIndex, targetItems.length);

    pendingFocusItemIdRef.current = draggedItemId;
    moveDraggedItemToGroup(targetGroup, targetIndex);
    announceKeyboardMove(draggedItemId, targetGroup);

    return true;
  };

  /** Commits a keyboard drag and announces the destination group. */
  const dropKeyboardDrag = () => {
    const draggedItemId = draggedItemIdRef.current;
    const sourceGroup = dragSourceGroupRef.current;

    if (draggedItemId) {
      pendingFocusItemIdRef.current = draggedItemId;
    }

    if (draggedItemId && sourceGroup) {
      const itemLabel = getItemById(draggedItemId)?.label;
      const groupLabel = getGroupLabel(sourceGroup);
      if (itemLabel) {
        setLiveAnnouncement(
          `${capitalizeLabel(itemLabel)} dropped in ${groupLabel}.`,
        );
      }
    }

    keyboardDragSnapshotRef.current = null;
    setKeyboardDraggedItemId(null);
    keyboardDraggedItemIdRef.current = null;
    resetDragState();
  };

  /** Restores the lists captured before a keyboard drag began. */
  const cancelKeyboardDrag = () => {
    const draggedItemId = draggedItemIdRef.current;
    const snapshot = keyboardDragSnapshotRef.current;

    if (snapshot) {
      commitLists(snapshot.headerItems, snapshot.stubItems);
    }

    if (draggedItemId) {
      const itemLabel = getItemById(draggedItemId)?.label;
      if (itemLabel) {
        setLiveAnnouncement(`${capitalizeLabel(itemLabel)} move cancelled.`);
      }
      pendingFocusItemIdRef.current = draggedItemId;
    }

    keyboardDragSnapshotRef.current = null;
    setKeyboardDraggedItemId(null);
    keyboardDraggedItemIdRef.current = null;
    resetDragState();
  };

  /** Clears shared state used by pointer and keyboard dragging. */
  const resetDragState = () => {
    isDraggingRef.current = false;
    draggedItemIdRef.current = null;
    dragSourceGroupRef.current = null;
    hoveredGroupRef.current = null;
    lastPointerYRef.current = null;
    pointerDragSnapshotRef.current = null;
    setSourcePlaceholderMeta(null);
    updateDropPreview(null);
  };

  /** Returns the group opposite the supplied group. */
  const getOtherGroup = (group: VariableGroup): VariableGroup =>
    group === 'header' ? 'stub' : 'header';

  /** Handles keyboard commands for selecting, moving, dropping, or cancelling an item. */
  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    group: VariableGroup,
    variableId: string,
  ) => {
    const isKeyboardDragging = keyboardDraggedItemIdRef.current === variableId;

    switch (event.key) {
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (isKeyboardDragging) {
          dropKeyboardDrag();
        } else if (!keyboardDraggedItemIdRef.current) {
          startKeyboardDrag(group, variableId);
        }
        return;
      }
      case 'Escape': {
        if (!isKeyboardDragging) {
          return;
        }
        event.preventDefault();
        cancelKeyboardDrag();
        return;
      }
      case 'ArrowUp': {
        if (!isKeyboardDragging) {
          return;
        }
        event.preventDefault();
        moveKeyboardDraggedItemWithinGroup(-1);
        return;
      }
      case 'ArrowDown': {
        if (!isKeyboardDragging) {
          return;
        }
        event.preventDefault();
        moveKeyboardDraggedItemWithinGroup(1);
        return;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        if (!isKeyboardDragging) {
          return;
        }
        event.preventDefault();
        moveKeyboardDraggedItemAcrossGroups(getOtherGroup(group));
        return;
      }
      default:
        return;
    }
  };

  /** Extracts client coordinates from the supported drag event shapes. */
  const getClientPoint = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if ('clientX' in event && 'clientY' in event) {
      return { x: event.clientX, y: event.clientY };
    }

    if ('touches' in event && event.touches.length > 0) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }

    if ('changedTouches' in event && event.changedTouches.length > 0) {
      return {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY,
      };
    }

    return { x: info.point.x, y: info.point.y };
  };

  /** Updates the active pointer drag preview as the pointer moves. */
  const handleItemDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const point = getClientPoint(event, info);
    lastPointerYRef.current = point.y;
    const detectedGroup = getGroupAtPoint(point.x, point.y);
    if (detectedGroup) {
      hoveredGroupRef.current = detectedGroup;
    }

    const hoveredGroup =
      detectedGroup ?? hoveredGroupRef.current ?? dragSourceGroupRef.current;

    const draggedItemId = draggedItemIdRef.current;
    if (hoveredGroup && draggedItemId) {
      updateDropPreview(
        getDropPreviewForGroup(hoveredGroup, point.y, draggedItemId),
      );
    } else {
      updateDropPreview(null);
    }
  };

  /** Resolves the final pointer drop position and moves the dragged item. */
  const handleItemDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const point = getClientPoint(event, info);
    lastPointerYRef.current = point.y;
    const detectedGroup = getGroupAtPoint(point.x, point.y);
    if (detectedGroup) {
      hoveredGroupRef.current = detectedGroup;
    }

    const hoveredGroup =
      detectedGroup ?? hoveredGroupRef.current ?? dragSourceGroupRef.current;

    const draggedItemId = draggedItemIdRef.current;
    if (hoveredGroup && draggedItemId) {
      updateDropPreview(
        getDropPreviewForGroup(hoveredGroup, point.y, draggedItemId),
      );
    }

    const persistedDropTarget = dropPreviewRef.current;
    const targetGroup = persistedDropTarget?.group ?? hoveredGroup;
    const targetIndex = persistedDropTarget?.index;

    if (targetGroup && typeof targetIndex === 'number') {
      moveDraggedItemToGroup(targetGroup, targetIndex);
    }
    resetDragState();
  };

  /** Captures source metadata and initializes a pointer drag. */
  const handleDragStart = (group: VariableGroup, variableId: string) => {
    isDraggingRef.current = true;
    draggedItemIdRef.current = variableId;
    dragSourceGroupRef.current = group;
    hoveredGroupRef.current = group;

    const sourceItems =
      group === 'header' ? headerItemsRef.current : stubItemsRef.current;
    const sourceIndex = sourceItems.findIndex((item) => item.id === variableId);
    const sourceLabel = sourceItems.find(
      (item) => item.id === variableId,
    )?.label;
    const sourceHeight = Math.max(
      40,
      Math.round(
        itemRefs.current.get(variableId)?.getBoundingClientRect().height ?? 40,
      ),
    );

    if (sourceIndex !== -1 && sourceLabel) {
      pointerDragSnapshotRef.current = {
        itemId: variableId,
        sourceGroup: group,
        sourceIndex,
        sourceLabel,
        sourceHeight,
      };
      setSourcePlaceholderMeta({ group, height: sourceHeight });
    }

    const zoneRect = (
      group === 'header' ? headerZoneRef.current : stubZoneRef.current
    )?.getBoundingClientRect();
    if (zoneRect) {
      updateDropPreview(
        getDropPreviewForGroup(group, zoneRect.top, variableId),
      );
    }
  };

  /** Applies a reorder while keeping variables unique across both groups. */
  const handleGroupReorder = (group: VariableGroup, nextItems: Variable[]) => {
    // Pointer drag uses custom preview/placeholder rendering; applying
    // framer-motion reorder updates at the same time causes visual thrash.
    if (isDraggingRef.current && keyboardDraggedItemId === null) {
      return;
    }

    let dedupedItems = dedupeById(nextItems);
    const draggedItemId = draggedItemIdRef.current;
    const sourceGroup = dragSourceGroupRef.current;

    if (isDraggingRef.current && draggedItemId && sourceGroup === group) {
      const hasDraggedItem = dedupedItems.some(
        (item) => item.id === draggedItemId,
      );

      if (!hasDraggedItem) {
        const currentGroupItems =
          group === 'header' ? headerItemsRef.current : stubItemsRef.current;
        const draggedItem = currentGroupItems.find(
          (item) => item.id === draggedItemId,
        );

        if (draggedItem) {
          dedupedItems = [...dedupedItems, draggedItem];
        }
      }
    }

    if (group === 'stub') {
      const nextHeaderItems = headerItemsRef.current.filter(
        (headerItem) =>
          !dedupedItems.some((stubItem) => stubItem.id === headerItem.id),
      );
      commitLists(nextHeaderItems, dedupedItems);
      return;
    }

    const nextStubItems = stubItemsRef.current.filter(
      (stubItem) =>
        !dedupedItems.some((headerItem) => headerItem.id === stubItem.id),
    );
    commitLists(dedupedItems, nextStubItems);
  };

  /** Renders one variable group and its drag, drop, and keyboard affordances. */
  const renderGroup = (
    group: VariableGroup,
    items: Variable[],
    zoneRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    const preview = dropPreview?.group === group ? dropPreview : null;
    const previewIndex = preview?.index;
    const pointerDragSnapshot = pointerDragSnapshotRef.current;
    const draggedItemId = draggedItemIdRef.current;
    const isPointerDragging =
      isDraggingRef.current && keyboardDraggedItemId === null;
    const sourcePlaceholderIndex =
      pointerDragSnapshot?.sourceGroup === group
        ? pointerDragSnapshot.sourceIndex
        : undefined;
    const isActivePointerDragSource =
      isPointerDragging && dragSourceGroupRef.current === group;
    const isHoveringEmptyGroup =
      isPointerDragging && items.length === 0 && preview?.group === group;
    const nonDraggedItemCount = items.reduce(
      (count, item) =>
        isPointerDragging && draggedItemId && item.id === draggedItemId
          ? count
          : count + 1,
      0,
    );
    let visibleItemIndex = 0;

    return (
      <section className={classes.groupColumn}>
        <Label>{getGroupLabelText(group)}</Label>
        <div ref={zoneRef} className={classes.groupZone}>
          <Reorder.Group
            axis="y"
            as="ul"
            values={items}
            onReorder={(nextItems) => handleGroupReorder(group, nextItems)}
            className={classes.list}
            style={{ zIndex: isActivePointerDragSource ? 20 : 1 }}
          >
            {items.length === 0 ? (
              <li aria-hidden="true">
                <EmtyList
                  label={t('manual_pivot.empty_group', {
                    defaultValue: 'Drop variable here',
                  })}
                  hideLabel={isHoveringEmptyGroup}
                  active={isHoveringEmptyGroup}
                />
              </li>
            ) : null}
            {items.map((variable, index) =>
              (() => {
                const isDraggedItem =
                  isPointerDragging && draggedItemId === variable.id;
                const currentVisibleIndex = visibleItemIndex;
                if (!isDraggedItem) {
                  visibleItemIndex += 1;
                }

                return (
                  <Fragment key={variable.id}>
                    {sourcePlaceholderIndex === index ? (
                      <li
                        aria-hidden="true"
                        className={`${classes.dropPlaceholder} ${classes.sourcePlaceholder}`}
                      />
                    ) : null}
                    {items.length > 0 &&
                    previewIndex === currentVisibleIndex &&
                    !isDraggedItem ? (
                      <li aria-hidden="true" className={classes.dropTargetRow}>
                        <DropTarget />
                      </li>
                    ) : null}
                    <Reorder.Item
                      as="li"
                      data-variable-id={variable.id}
                      value={variable}
                      className={`${classes.listItem}${
                        (isDraggedItem || keyboardDraggedItemId === variable.id)
                          ? ` ${classes.listItemDragging}`
                          : ''
                      }`}
                      style={{
                        position:
                          isDraggingRef.current &&
                          keyboardDraggedItemId === null &&
                          draggedItemIdRef.current === variable.id
                            ? 'absolute'
                            : 'relative',
                        left: 0,
                        right: 0,
                        zIndex:
                          isDraggingRef.current &&
                          draggedItemIdRef.current === variable.id
                            ? 10
                            : previewIndex !== undefined && index < previewIndex
                              ? 3
                              : 1,
                      }}
                      ref={(element: HTMLLIElement | null) => {
                        if (element) {
                          itemRefs.current.set(variable.id, element);
                        } else {
                          itemRefs.current.delete(variable.id);
                        }
                      }}
                      tabIndex={0}
                      aria-grabbed={keyboardDraggedItemId === variable.id}
                      aria-describedby={keyboardInstructionsId}
                      drag
                      dragMomentum={false}
                      dragElastic={0}
                      whileDrag={{ scale: 1.02 }}
                      onDragStart={() => handleDragStart(group, variable.id)}
                      onDrag={handleItemDrag}
                      onDragEnd={handleItemDragEnd}
                      onKeyDown={(event) =>
                        handleItemKeyDown(event, group, variable.id)
                      }
                    >
                      <DataItem label={capitalizeLabel(variable.label)} />
                    </Reorder.Item>
                  </Fragment>
                );
              })(),
            )}
            {sourcePlaceholderIndex === items.length ? (
              <li
                aria-hidden="true"
                className={`${classes.dropPlaceholder} ${classes.sourcePlaceholder}`}
              />
            ) : null}
            {items.length > 0 && previewIndex === nonDraggedItemCount ? (
              <li aria-hidden="true" className={classes.dropTargetRow}>
                <DropTarget />
              </li>
            ) : null}
          </Reorder.Group>
        </div>
      </section>
    );
  };

  return (
    <Modal
      className={classes.manualPivotModal}
      isOpen={isOpen}
      focusTrap
      onClose={(updated) => onClose(updated, headerItems, stubItems)}
      heading={t('presentation_page.side_menu.edit.customize.pivot.title')}
      label={t('presentation_page.side_menu.edit.title')}
      cancelLabel={t(
        'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.cancel_button',
      )}
      confirmLabel={t(
        'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.confirm_button',
      )}
    >
      <p id={keyboardInstructionsId} className={classes.visuallyHidden}>
        Press Space or Enter to pick up an item. Use arrow keys to move it, then
        press Enter to drop. Press Escape to cancel.
      </p>
      <div className={classes.visuallyHidden} aria-live="polite">
        {liveAnnouncement}
      </div>
      <div data-modal-body className={classes.modalBody}>
        <InformationCard icon="LightBulb">
          <BodyLong size="medium">
            {t(
              'presentation_page.side_menu.edit.customize.manual_pivoting.manual_pivoting_modal.info_text',
            )}
          </BodyLong>
        </InformationCard>
        <div className={classes.wrapper}>
          {renderGroup('stub', stubItems, stubZoneRef)}
          {renderGroup('header', headerItems, headerZoneRef)}
        </div>
      </div>
    </Modal>
  );
}

export default ManualPivot;
