import React from 'react';
import useVariables from '../../../context/useVariables';

export const TableView: React.FC = () => {
  const data = useVariables();
  console.log('TABLEVIEW');
  return (
    <div>
      <div>Selected Variables: {data.toString()} </div>
    </div>
  );
};
