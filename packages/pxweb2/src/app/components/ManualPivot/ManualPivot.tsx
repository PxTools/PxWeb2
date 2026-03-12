import { useEffect, useRef, useState } from 'react';
import { Reorder, type PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { Modal, Variable } from '@pxweb2/pxweb2-ui';
import classes from './ManualPivot.module.scss';

interface ManualPivotProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
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
  const headerZoneRef = useRef<HTMLDivElement | null>(null);
  const stubZoneRef = useRef<HTMLDivElement | null>(null);
  const draggedItemIdRef = useRef<string | null>(null);
  const dragSourceGroupRef = useRef<'header' | 'stub' | null>(null);
  const hoveredGroupRef = useRef<'header' | 'stub' | null>(null);
  const [activeDropGroup, setActiveDropGroup] = useState<
    'header' | 'stub' | null
  >(null);

  useEffect(() => {
    if (isOpen) {
      setHeaderItems(headerVariables);
      setStubItems(stubVariables);
    }
  }, [headerVariables, isOpen, stubVariables]);

  const getGroupAtPoint = (x: number, y: number): 'header' | 'stub' | null => {
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

  const moveItemBetweenGroups = () => {
    const draggedItemId = draggedItemIdRef.current;
    const dragSourceGroup = dragSourceGroupRef.current;
    const hoveredGroup = hoveredGroupRef.current;

    if (!draggedItemId || !dragSourceGroup || !hoveredGroup) {
      return;
    }

    if (dragSourceGroup === hoveredGroup) {
      return;
    }

    const sourceItems = dragSourceGroup === 'header' ? headerItems : stubItems;
    const targetItems = hoveredGroup === 'header' ? headerItems : stubItems;
    const movingItem = sourceItems.find((item) => item.id === draggedItemId);

    if (!movingItem) {
      return;
    }

    const nextSourceItems = sourceItems.filter(
      (item) => item.id !== draggedItemId,
    );
    const nextTargetItems = [
      ...targetItems.filter((item) => item.id !== draggedItemId),
      movingItem,
    ];

    if (dragSourceGroup === 'header') {
      setHeaderItems(nextSourceItems);
      setStubItems(nextTargetItems);
    } else {
      setStubItems(nextSourceItems);
      setHeaderItems(nextTargetItems);
    }
  };

  const resetDragState = () => {
    draggedItemIdRef.current = null;
    dragSourceGroupRef.current = null;
    hoveredGroupRef.current = null;
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
    const hoveredGroup = getGroupAtPoint(point.x, point.y);
    hoveredGroupRef.current = hoveredGroup;
    setActiveDropGroup(hoveredGroup);
  };

  const handleItemDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const point = getClientPoint(event, info);
    const hoveredGroup = getGroupAtPoint(point.x, point.y);
    hoveredGroupRef.current = hoveredGroup;
    setActiveDropGroup(hoveredGroup);

    moveItemBetweenGroups();
    resetDragState();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      // heading={t('presentation_page.main_content.about_table.manual_pivot.heading')}
      // label={t('presentation_page.main_content.about_table.manual_pivot.label')}
      heading={t('presentation_page.side_menu.edit.customize.pivot.title')}
      label={t('presentation_page.side_menu.edit.title')}
    >
      <div className={classes.wrapper}>
        <section className={classes.groupColumn}>
          <h4>Header variables</h4>
          <div ref={headerZoneRef} className={classes.groupZone}>
            <Reorder.Group
              axis="y"
              as="ul"
              values={headerItems}
              onReorder={setHeaderItems}
              className={classes.list}
            >
              {headerItems.map((variable) => (
                <Reorder.Item
                  as="li"
                  key={variable.id}
                  value={variable}
                  className={classes.listItem}
                  drag
                  dragMomentum={false}
                  dragElastic={0.12}
                  whileDrag={{
                    scale: 1.02,
                    zIndex: 10,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  }}
                  onDragStart={() => {
                    draggedItemIdRef.current = variable.id;
                    dragSourceGroupRef.current = 'header';
                    hoveredGroupRef.current = 'header';
                    setActiveDropGroup('header');
                  }}
                  onDrag={handleItemDrag}
                  onDragEnd={handleItemDragEnd}
                >
                  {variable.label}
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <div
              className={`${classes.dropZone} ${activeDropGroup === 'header' ? classes.dropZoneActive : ''}`}
            >
              Drop here
            </div>
          </div>
        </section>

        <section className={classes.groupColumn}>
          <h4>Stub variables</h4>
          <div ref={stubZoneRef} className={classes.groupZone}>
            <Reorder.Group
              axis="y"
              as="ul"
              values={stubItems}
              onReorder={setStubItems}
              className={classes.list}
            >
              {stubItems.map((variable) => (
                <Reorder.Item
                  as="li"
                  key={variable.id}
                  value={variable}
                  className={classes.listItem}
                  drag
                  dragMomentum={false}
                  dragElastic={0.12}
                  whileDrag={{
                    scale: 1.02,
                    zIndex: 10,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                  }}
                  onDragStart={() => {
                    draggedItemIdRef.current = variable.id;
                    dragSourceGroupRef.current = 'stub';
                    hoveredGroupRef.current = 'stub';
                    setActiveDropGroup('stub');
                  }}
                  onDrag={handleItemDrag}
                  onDragEnd={handleItemDragEnd}
                >
                  {variable.label}
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <div
              className={`${classes.dropZone} ${activeDropGroup === 'stub' ? classes.dropZoneActive : ''}`}
            >
              Drop here
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default ManualPivot;
