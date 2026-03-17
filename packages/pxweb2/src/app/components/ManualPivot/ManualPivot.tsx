import { useEffect, useRef, useState } from 'react';
import { Reorder, type PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Label } from '@pxweb2/pxweb2-ui';

import { Modal, Variable } from '@pxweb2/pxweb2-ui';
import classes from './ManualPivot.module.scss';

type VariableGroup = 'header' | 'stub';
type GroupLabelKey =
  | 'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.stub_variable_header'
  | 'presentation_page.side_menu.edit.customize.rearrange.rearrange_modal.heading_variable_header';

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
  const [headerItems, setHeaderItems] = useState<Variable[]>(headerVariables);
  const [stubItems, setStubItems] = useState<Variable[]>(stubVariables);
  const headerItemsRef = useRef<Variable[]>(headerVariables);
  const stubItemsRef = useRef<Variable[]>(stubVariables);
  const headerZoneRef = useRef<HTMLDivElement | null>(null);
  const stubZoneRef = useRef<HTMLDivElement | null>(null);
  const draggedItemIdRef = useRef<string | null>(null);
  const dragSourceGroupRef = useRef<VariableGroup | null>(null);
  const hoveredGroupRef = useRef<VariableGroup | null>(null);
  const lastPointerYRef = useRef<number | null>(null);
  const [activeDropGroup, setActiveDropGroup] = useState<VariableGroup | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      setHeaderItems(headerVariables);
      setStubItems(stubVariables);
      headerItemsRef.current = headerVariables;
      stubItemsRef.current = stubVariables;
    }
  }, [headerVariables, isOpen, stubVariables]);

  const commitLists = (nextHeaderItems: Variable[], nextStubItems: Variable[]) => {
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

  const getGroupAtPoint = (x: number, y: number): VariableGroup | null => {
    const headerRect = headerZoneRef.current?.getBoundingClientRect();
    if (
      headerRect &&
      x >= headerRect.left &&
      x <= headerRect.right &&
      y >= headerRect.top &&
      y <= headerRect.bottom
    ) {
      return 'header';
    }

    const stubRect = stubZoneRef.current?.getBoundingClientRect();
    if (
      stubRect &&
      x >= stubRect.left &&
      x <= stubRect.right &&
      y >= stubRect.top &&
      y <= stubRect.bottom
    ) {
      return 'stub';
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
      zoneRef.current?.querySelectorAll<HTMLElement>('[data-variable-id]') ?? [],
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

  const moveItemBetweenGroups = () => {
    const draggedItemId = draggedItemIdRef.current;
    const currentGroup = dragSourceGroupRef.current;
    const hoveredGroup = hoveredGroupRef.current;
    const lastPointerY = lastPointerYRef.current;

    if (
      !draggedItemId ||
      !currentGroup ||
      !hoveredGroup ||
      lastPointerY === null
    ) {
      return;
    }

    if (currentGroup === hoveredGroup) {
      return;
    }

    const sourceItems =
      currentGroup === 'header' ? headerItemsRef.current : stubItemsRef.current;
    const targetItems =
      hoveredGroup === 'header' ? headerItemsRef.current : stubItemsRef.current;
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
    const insertIndex = getInsertIndexForGroup(
      hoveredGroup,
      lastPointerY,
      draggedItemId,
    );
    nextTargetItems.splice(insertIndex, 0, movingItem);

    if (currentGroup === 'header') {
      commitLists(nextSourceItems, nextTargetItems);
    } else {
      commitLists(nextTargetItems, nextSourceItems);
    }

    dragSourceGroupRef.current = hoveredGroup;
  };

  const resetDragState = () => {
    draggedItemIdRef.current = null;
    dragSourceGroupRef.current = null;
    hoveredGroupRef.current = null;
    lastPointerYRef.current = null;
    setActiveDropGroup(null);
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
    const hoveredGroup = getGroupAtPoint(point.x, point.y);
    hoveredGroupRef.current = hoveredGroup;
    setActiveDropGroup(hoveredGroup);

    if (hoveredGroup && hoveredGroup !== dragSourceGroupRef.current) {
      moveItemBetweenGroups();
    }
  };

  const handleItemDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const point = getClientPoint(event, info);
    lastPointerYRef.current = point.y;
    const hoveredGroup = getGroupAtPoint(point.x, point.y);
    hoveredGroupRef.current = hoveredGroup;
    setActiveDropGroup(hoveredGroup);

    if (hoveredGroup && hoveredGroup !== dragSourceGroupRef.current) {
      moveItemBetweenGroups();
    }
    resetDragState();
  };

  const handleDragStart = (group: VariableGroup, variableId: string) => {
    draggedItemIdRef.current = variableId;
    dragSourceGroupRef.current = group;
    hoveredGroupRef.current = group;
    setActiveDropGroup(group);
  };

  const handleGroupReorder = (group: VariableGroup, nextItems: Variable[]) => {
    const dedupedItems = dedupeById(nextItems);

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
  ) => (
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
          {items.map((variable) => (
            <Reorder.Item
              as="li"
              key={variable.id}
              data-variable-id={variable.id}
              value={variable}
              className={classes.listItem}
              tabIndex={0}
              drag
              dragMomentum={false}
              dragElastic={0}
              whileDrag={{
                scale: 1.02,
                zIndex: 10,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
              }}
              onDragStart={() => handleDragStart(group, variable.id)}
              onDrag={handleItemDrag}
              onDragEnd={handleItemDragEnd}
            >
              {variable.label}
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <div
          className={`${classes.dropZone} ${activeDropGroup === group ? classes.dropZoneActive : ''}`}
        >
          Drop here
        </div>
      </div>
    </section>
  );

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
