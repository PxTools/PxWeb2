// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';


import { Button, Label } from '@pxweb2/pxweb2-ui';

function test(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
  event.preventDefault();
  alert('test');
}
function testSubmit() {
  alert('test submit'); 
}

export function App() {
  return (
    <>
      <h1>Welcome to pxweb2!</h1>

      <Label size='medium' align='start' textcolor='subtle'>This is a label</Label>

      <Button variant="primary" onClick={test}>Button</Button>
      <Button variant="primary" disabled onClick={test}>Button</Button>
      <Button variant="primary" icon="Pencil" onClick={test}></Button>
      <Button variant="primary" icon="ChevronUp" onClick={test} size="small" ></Button>

      <Button variant="secondary" onClick={test}>Button</Button>
      <Button variant="secondary" disabled onClick={test}>Button</Button>
      <Button variant="secondary" icon="Pencil" onClick={test}></Button>
      <Button variant="secondary" icon="ChevronUp" onClick={test} size="small" ></Button>

      <Button variant="tertiary" onClick={test}>Button</Button>
      <Button variant="tertiary" disabled onClick={test}>Button</Button>
      <Button variant="tertiary" icon="Pencil" onClick={test}></Button>
      <Button variant="tertiary" icon="ChevronUp" onClick={test} size="small" ></Button>

      <form id="form1" onSubmit={ testSubmit }>
        <label htmlFor="fname">First name:</label><br />
        <input type="text" id="fname" name="fname" defaultValue="John" /><br />
        <label htmlFor="lname">Last name:</label><br />
        <input type="text" id="lname" name="lname" defaultValue="Doe" />
      </form>
      <Button form="form1" variant="primary" type="submit">Button</Button>
      
    </>
  );
}

export default App;
