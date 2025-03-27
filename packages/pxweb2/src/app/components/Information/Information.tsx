import styles from './Information.module.scss';

const Information = () => {
  return (
    <div className={styles.information}>
      <h2>Information</h2>
      <p>
        This is a page where you can filter tables based on a filter. The filter
        is a simple object with a type and a value. You can add multiple filters
        and the tables will be filtered based on the filters. You can also reset
        the filters.
      </p>
    </div>
  );
};

export default Information;
