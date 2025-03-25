export type Filter = {
  type: 'text' | 'category' | 'timeUnit' | 'path' | 'variableName';
  value: string;
};
