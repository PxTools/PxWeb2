import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  Legend,
  Line,
  BarChart,
  Bar,
} from 'recharts';

const data = [
  { region: 'Stockholm', year: 2021, agegroup: '10-19', value: 120 },
  { region: 'Stockholm', year: 2021, agegroup: '20-29', value: 180 },
  { region: 'Stockholm', year: 2021, agegroup: '30-39', value: 240 },
  { region: 'Stockholm', year: 2021, agegroup: '40-49', value: 300 },
  { region: 'Stockholm', year: 2022, agegroup: '10-19', value: 130 },
  { region: 'Stockholm', year: 2022, agegroup: '20-29', value: 190 },
  { region: 'Stockholm', year: 2022, agegroup: '30-39', value: 250 },
  { region: 'Stockholm', year: 2022, agegroup: '40-49', value: 310 },
  { region: 'Stockholm', year: 2023, agegroup: '10-19', value: 140 },
  { region: 'Stockholm', year: 2023, agegroup: '20-29', value: 200 },
  { region: 'Stockholm', year: 2023, agegroup: '30-39', value: 260 },
  { region: 'Stockholm', year: 2023, agegroup: '40-49', value: 320 },
];

const data2 = [
  { tid: '2021', '10-19_BE0101N1_0180': 100336 },
  { tid: '2021', '20-29_BE0101N1_0180': 136108 },
  { tid: '2021', '30-39_BE0101N1_0180': 175307 },
  { tid: '2021', '40-49_BE0101N1_0180': 134241 },
  { tid: '2022', '10-19_BE0101N1_0180': 101839 },
  { tid: '2022', '20-29_BE0101N1_0180': 134438 },
  { tid: '2022', '30-39_BE0101N1_0180': 177526 },
  { tid: '2022', '40-49_BE0101N1_0180': 135047 },
  { tid: '2023', '10-19_BE0101N1_0180': 103267 },
  { tid: '2023', '20-29_BE0101N1_0180': 132271 },
  { tid: '2023', '30-39_BE0101N1_0180': 177909 },
  { tid: '2023', '40-49_BE0101N1_0180': 135659 },
];

const data3 = [
  {
    tid: '2021',
    '10-19_BE0101N1_0180': 100336,
    '20-29_BE0101N1_0180': 136108,
    '30-39_BE0101N1_0180': 175307,
    '40-49_BE0101N1_0180': 134241,
  },
  {
    tid: '2022',
    '10-19_BE0101N1_0180': 101839,
    '20-29_BE0101N1_0180': 134438,
    '30-39_BE0101N1_0180': 177526,
    '40-49_BE0101N1_0180': 135047,
  },
  {
    tid: '2023',
    '10-19_BE0101N1_0180': 103267,
    '20-29_BE0101N1_0180': 132271,
    '30-39_BE0101N1_0180': 177909,
    '40-49_BE0101N1_0180': 135659,
  },
];

export function LineChartComponent() {
  return (
    // <ResponsiveContainer width={700} height="80%">
    //   <LineChart
    //     width={730}
    //     height={250}
    //     data={data}
    //     margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    //   >
    //     <CartesianGrid strokeDasharray="3 3" />
    //     <XAxis dataKey="year" />
    //     <YAxis />
    //     <Tooltip />
    //     <Legend />
    //     <Line type="monotone" dataKey="pv" stroke="#8884d8" />
    //     <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
    //   </LineChart>
    // </ResponsiveContainer>
    <>
      <LineChart width={600} height={300} data={data3}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="tid" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="10-19_BE0101N1_0180" stroke="blue" />
        <Line type="monotone" dataKey="20-29_BE0101N1_0180" stroke="red" />
        <Line type="monotone" dataKey="30-39_BE0101N1_0180" stroke="green" />
        <Line type="monotone" dataKey="40-49_BE0101N1_0180" stroke="black" />
      </LineChart>
      <BarChart
        width={600}
        height={300}
        data={data3}
        //margin={{ top: 15, right: 30, left: 30, bottom: 30 }}
      >
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="tid">
          {/* <Label value="Year" offset={-10} position="insideBottom" /> */}
          <Label value="Year" offset={0} position="bottom" />
        </XAxis>
        <YAxis type="number">
          <Label

            value="ValueValueValue"
            offset={-3}
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: 'middle', dominantBaseline: 'middle' }}
          />
        </YAxis>
        <Tooltip />
        <Legend wrapperStyle={{ margin: -20 }} />
        <Bar type="monotone" dataKey="10-19_BE0101N1_0180" fill="blue" />
        <Bar type="monotone" dataKey="20-29_BE0101N1_0180" fill="red" />
        <Bar type="monotone" dataKey="30-39_BE0101N1_0180" fill="green" />
        <Bar type="monotone" dataKey="40-49_BE0101N1_0180" fill="black" />
      </BarChart>
      <BarChart
        width={600}
        height={300}
        data={data3}
        layout="vertical"
        margin={{ top: 15, right: 30, left: 30, bottom: 30 }}
      >
        <CartesianGrid stroke="#ccc" />
        <XAxis type="number">
          <Label value="Year" offset={0} position="bottom" />
        </XAxis>
        <YAxis type="category" dataKey="tid">
          <Label
            value="Age group"
            offset={0}
            angle={-90}
            position="insideLeft"
          />
        </YAxis>
        <Tooltip />
        <Legend  wrapperStyle={{ margin: -20 }} />
        <Bar type="monotone" dataKey="10-19_BE0101N1_0180" fill="blue" />
        <Bar type="monotone" dataKey="20-29_BE0101N1_0180" fill="red" />
        <Bar type="monotone" dataKey="30-39_BE0101N1_0180" fill="green" />
        <Bar type="monotone" dataKey="40-49_BE0101N1_0180" fill="black" />
      </BarChart>
    </>
  );
}
