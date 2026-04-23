import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { Reorder, type PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { Modal, Variable, BodyShort, Label } from '@pxweb2/pxweb2-ui';
import classes from './ManualPivot.module.scss';

type VariableGroup = 'header' | 'stub';
type DropPreview = {
  group: VariableGroup;
  index: number;
  height: number;
} | null;
type GroupLabelKey =
  | 'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.stub_variable_header'
  | 'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.heading_variable_header';
type KeyboardDragSnapshot = {
  headerItems: Variable[];
  stubItems: Variable[];
};

interface ManualPivotProps {
  readonly isOpen: boolean;
  readonly onClose: (headerItems: Variable[], stubItems: Variable[]) => void;
  readonly headerVariables: Variable[];
  readonly stubVariables: Variable[];
}

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
  const [dropPreview, setDropPreview] = useState<DropPreview>(null);

  useEffect(() => {
    if (isOpen) {
      setHeaderItems(headerVariables);
      setStubItems(stubVariables);
      headerItemsRef.current = headerVariables;
      stubItemsRef.current = stubVariables;
      setKeyboardDraggedItemId(null);
      setLiveAnnouncement('');
      keyboardDragSnapshotRef.current = null;
    }
  }, [headerVariables, isOpen, stubVariables]);

  useEffect(() => {
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

  useEffect(() => {
    headerZoneRef.current?.style.removeProperty('--drop-preview-height');
    stubZoneRef.current?.style.removeProperty('--drop-preview-height');

    if (!dropPreview) {
      return;
    }

    const zoneRef =
      dropPreview.group === 'header' ? headerZoneRef : stubZoneRef;
    zoneRef.current?.style.setProperty(
      '--drop-preview-height',
      `${dropPreview.height}px`,
    );
  }, [dropPreview]);

  const commitLists = (
    nextHeaderItems: Variable[],
    nextStubItems: Variable[],
  ) => {
    headerItemsRef.current = nextHeaderItems;
    stubItemsRef.current = nextStubItems;
    setHeaderItems(nextHeaderItems);
    setStubItems(nextStubItems);
  };

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

  const capitalizeLabel = (label: string): string =>
    label.charAt(0).toUpperCase() + label.slice(1);

  const getGroupAtPoint = (x: number, y: number): VariableGroup | null => {
    const hitPadding = 20;
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

    const nearestGroup = headerDistance <= stubDistance ? 'header' : 'stub';
    const nearestDistance = Math.min(headerDistance, stubDistance);

    if (nearestDistance <= hitPadding) {
      return nearestGroup;
    }

    return null;
  };

  const getInsertIndexForGroup = (
    group: VariableGroup,
    pointerY: number,
    draggedItemId: string,
  ): number => {
    const zoneRef = group === 'header' ? headerZoneRef : stubZoneRef;
    const itemElements = Array.from(
      zoneRef.current?.querySelectorAll<HTMLElement>('[data-variable-id]') ??
        [],
    ).filter((element) => element.dataset.variableId !== draggedItemId);

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

    const index = getInsertIndexForGroup(group, pointerY, draggedItemId);
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

  const updateDropPreview = (nextPreview: DropPreview) => {
    dropPreviewRef.current = nextPreview;
    setDropPreview(nextPreview);
  };

  const moveDraggedItemToGroup = (
    targetGroup: VariableGroup,
    targetIndex: number,
  ) => {
    const draggedItemId = draggedItemIdRef.current;
    const sourceGroup = dragSourceGroupRef.current;

    if (!draggedItemId || !sourceGroup) {
      return;
    }

    if (sourceGroup === targetGroup) {
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

  const getItemsForGroup = (group: VariableGroup): Variable[] =>
    group === 'header' ? headerItemsRef.current : stubItemsRef.current;

  const getItemById = (itemId: string): Variable | undefined =>
    [...headerItemsRef.current, ...stubItemsRef.current].find(
      (item) => item.id === itemId,
    );

  const getGroupLabel = (group: VariableGroup): string =>
    group === 'stub'
      ? t(
          'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.stub_variable_header',
        )
      : t(
          'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.heading_variable_header',
        );

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

    const itemLabel = getItemById(variableId)?.label;
    if (itemLabel) {
      const capitalizedItemLabel = capitalizeLabel(itemLabel);
      setLiveAnnouncement(
        `${capitalizedItemLabel} selected. Use arrow keys to move, Enter to drop, Escape to cancel.`,
      );
    }
  };

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

    if (sourceGroup === 'header') {
      commitLists(nextSourceItems, stubItemsRef.current);
    } else {
      commitLists(headerItemsRef.current, nextSourceItems);
    }

    pendingFocusItemIdRef.current = draggedItemId;
    announceKeyboardMove(draggedItemId, sourceGroup);

    return true;
  };

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

    moveDraggedItemToGroup(targetGroup, targetIndex);
    pendingFocusItemIdRef.current = draggedItemId;
    announceKeyboardMove(draggedItemId, targetGroup);

    return true;
  };

  const dropKeyboardDrag = () => {
    const draggedItemId = draggedItemIdRef.current;
    const sourceGroup = dragSourceGroupRef.current;

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
    resetDragState();
  };

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
    resetDragState();
  };

  const resetDragState = () => {
    isDraggingRef.current = false;
    draggedItemIdRef.current = null;
    dragSourceGroupRef.current = null;
    hoveredGroupRef.current = null;
    lastPointerYRef.current = null;
    updateDropPreview(null);
  };

  const getOtherGroup = (group: VariableGroup): VariableGroup =>
    group === 'header' ? 'stub' : 'header';

  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    group: VariableGroup,
    variableId: string,
  ) => {
    const isKeyboardDragging = keyboardDraggedItemId === variableId;

    switch (event.key) {
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (isKeyboardDragging) {
          dropKeyboardDrag();
        } else if (!keyboardDraggedItemId) {
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

    if (
      targetGroup &&
      typeof targetIndex === 'number' &&
      targetGroup !== dragSourceGroupRef.current
    ) {
      moveDraggedItemToGroup(targetGroup, targetIndex);
    }
    resetDragState();
  };

  const handleDragStart = (group: VariableGroup, variableId: string) => {
    isDraggingRef.current = true;
    draggedItemIdRef.current = variableId;
    dragSourceGroupRef.current = group;
    hoveredGroupRef.current = group;

    const zoneRect = (
      group === 'header' ? headerZoneRef.current : stubZoneRef.current
    )?.getBoundingClientRect();
    if (zoneRect) {
      updateDropPreview(
        getDropPreviewForGroup(group, zoneRect.top, variableId),
      );
    }
  };

  const handleGroupReorder = (group: VariableGroup, nextItems: Variable[]) => {
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

  const renderGroup = (
    group: VariableGroup,
    labelKey: GroupLabelKey,
    items: Variable[],
    zoneRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    const preview = dropPreview?.group === group ? dropPreview : null;
    const previewIndex = preview?.index;
    const draggedItemLabel = draggedItemIdRef.current
      ? [...headerItemsRef.current, ...stubItemsRef.current].find(
          (item) => item.id === draggedItemIdRef.current,
        )?.label
      : undefined;
    const capitalizedDraggedItemLabel = draggedItemLabel
      ? capitalizeLabel(draggedItemLabel)
      : undefined;

    return (
      <section className={classes.groupColumn}>
        <Label>{t(labelKey)}</Label>
        <div ref={zoneRef} className={classes.groupZone}>
          <Reorder.Group
            axis="y"
            as="ul"
            values={items}
            onReorder={(nextItems) => handleGroupReorder(group, nextItems)}
            className={classes.list}
          >
            {items.map((variable, index) => (
              <Fragment key={variable.id}>
                {previewIndex === index ? (
                  <li
                    aria-hidden="true"
                    className={classes.dropPlaceholder}
                    title={capitalizedDraggedItemLabel}
                  >
                    {capitalizedDraggedItemLabel ? (
                      <span className={classes.dropPlaceholderLabel}>
                        {capitalizedDraggedItemLabel}
                      </span>
                    ) : null}
                  </li>
                ) : null}
                <Reorder.Item
                  as="li"
                  data-variable-id={variable.id}
                  value={variable}
                  className={classes.listItem}
                  style={{
                    zIndex:
                      isDraggingRef.current &&
                      draggedItemIdRef.current === variable.id
                        ? 2
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
                  whileDrag={{
                    scale: 1.02,
                    zIndex: 2,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  }}
                  onDragStart={() => handleDragStart(group, variable.id)}
                  onDrag={handleItemDrag}
                  onDragEnd={handleItemDragEnd}
                  onKeyDown={(event) =>
                    handleItemKeyDown(event, group, variable.id)
                  }
                >
                  <BodyShort size="medium">
                    {capitalizeLabel(variable.label)}
                  </BodyShort>
                </Reorder.Item>
              </Fragment>
            ))}
            {previewIndex === items.length ? (
              <li
                aria-hidden="true"
                className={classes.dropPlaceholder}
                title={capitalizedDraggedItemLabel}
              >
                {capitalizedDraggedItemLabel ? (
                  <span className={classes.dropPlaceholderLabel}>
                    {capitalizedDraggedItemLabel}
                  </span>
                ) : null}
              </li>
            ) : null}
          </Reorder.Group>
        </div>
      </section>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(headerItems, stubItems)}
      heading={t('presentation_page.side_menu.edit.customize.pivot.title')}
      label={t('presentation_page.side_menu.edit.title')}
      cancelLabel={t(
        'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.cancel_button',
      )}
      confirmLabel={t(
        'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.confirm_button',
      )}
    >
      <p id={keyboardInstructionsId} className={classes.visuallyHidden}>
        Press Space or Enter to pick up an item. Use arrow keys to move it, then
        press Enter to drop. Press Escape to cancel.
      </p>
      <div className={classes.visuallyHidden} aria-live="polite">
        {liveAnnouncement}
      </div>
      <div className={classes.wrapper}>
        {renderGroup(
          'stub',
          'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.stub_variable_header',
          stubItems,
          stubZoneRef,
        )}
        {renderGroup(
          'header',
          'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.heading_variable_header',
          headerItems,
          headerZoneRef,
        )}
      </div>
    </Modal>
  );
}

export default ManualPivot;
