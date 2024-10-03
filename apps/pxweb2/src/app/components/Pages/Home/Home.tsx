import { Link } from 'react-router-dom';
import styles from './Home.module.scss';

export function Home() {
  return (
    <div className={styles.home}>
      <h1>Velg en tabell</h1>

      <nav>
        <ul>
          <li>
            <Link to={`table/TAB638`}>TAB638</Link>
          </li>
          <li>
            <Link to={`table/TAB1292`}>TAB1292</Link>
          </li>
          <li>
            <Link to={`table/TAB5659`}>TAB5659</Link>
          </li>
          <li>
            <Link to={`table/TAB1544`}>TAB1544 (decimals)</Link>
          </li>
          <li>
            <Link to={`table/TAB4246`}>TAB4246 (decimals)</Link>
          </li>
          <li>
            <Link to={`table/TAB1128`}>TAB1128 (large)</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
