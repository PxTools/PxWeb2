
interface LineChartProps {
  readonly text: string;
}

export function LineChart({ text }: LineChartProps) {
    return (<div>{text}</div>);
}

export default LineChart;
