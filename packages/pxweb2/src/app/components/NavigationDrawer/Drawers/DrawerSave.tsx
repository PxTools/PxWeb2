import { ContentBox } from '@pxweb2/pxweb2-ui';

export function DrawerSave() {
  return (
    <>
      <ContentBox title="Contentbox with title">
        This is inside another with a title ContentBox
      </ContentBox>
      <ContentBox>This is inside a ContentBox</ContentBox>
    </>
  );
}

DrawerSave.displayName = 'DrawerSave';
