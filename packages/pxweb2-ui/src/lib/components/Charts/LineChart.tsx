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
  Brush,
} from 'recharts';

// const data = [
//   { region: 'Stockholm', year: 2021, agegroup: '10-19', value: 120 },
//   { region: 'Stockholm', year: 2021, agegroup: '20-29', value: 180 },
//   { region: 'Stockholm', year: 2021, agegroup: '30-39', value: 240 },
//   { region: 'Stockholm', year: 2021, agegroup: '40-49', value: 300 },
//   { region: 'Stockholm', year: 2022, agegroup: '10-19', value: 130 },
//   { region: 'Stockholm', year: 2022, agegroup: '20-29', value: 190 },
//   { region: 'Stockholm', year: 2022, agegroup: '30-39', value: 250 },
//   { region: 'Stockholm', year: 2022, agegroup: '40-49', value: 310 },
//   { region: 'Stockholm', year: 2023, agegroup: '10-19', value: 140 },
//   { region: 'Stockholm', year: 2023, agegroup: '20-29', value: 200 },
//   { region: 'Stockholm', year: 2023, agegroup: '30-39', value: 260 },
//   { region: 'Stockholm', year: 2023, agegroup: '40-49', value: 320 },
// ];

// const data2 = [
//   { tid: '2021', '10-19_BE0101N1_0180': 100336 },
//   { tid: '2021', '20-29_BE0101N1_0180': 136108 },
//   { tid: '2021', '30-39_BE0101N1_0180': 175307 },
//   { tid: '2021', '40-49_BE0101N1_0180': 134241 },
//   { tid: '2022', '10-19_BE0101N1_0180': 101839 },
//   { tid: '2022', '20-29_BE0101N1_0180': 134438 },
//   { tid: '2022', '30-39_BE0101N1_0180': 177526 },
//   { tid: '2022', '40-49_BE0101N1_0180': 135047 },
//   { tid: '2023', '10-19_BE0101N1_0180': 103267 },
//   { tid: '2023', '20-29_BE0101N1_0180': 132271 },
//   { tid: '2023', '30-39_BE0101N1_0180': 177909 },
//   { tid: '2023', '40-49_BE0101N1_0180': 135659 },
// ];

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

const dummyData = [
  {
    tid: '2012',
    '10-19_BE0101N1_0180': 100336,
    '20-29_BE0101N1_0180': 136108,
    '30-39_BE0101N1_0180': 175307,
    '40-49_BE0101N1_0180': 134241,
  },
  {
    tid: '2013',
    '10-19_BE0101N1_0180': 80000,
    '20-29_BE0101N1_0180': 95555,
    '30-39_BE0101N1_0180': 15555,
    '40-49_BE0101N1_0180': 133355,
  },
  {
    tid: '2014',
    '10-19_BE0101N1_0180': 10326,
    '20-29_BE0101N1_0180': 134271,
    '30-39_BE0101N1_0180': 174809,
    '40-49_BE0101N1_0180': 145659,
  },
  {
    tid: '2015',
    '10-19_BE0101N1_0180': 170336,
    '20-29_BE0101N1_0180': 186108,
    '30-39_BE0101N1_0180': 145307,
    '40-49_BE0101N1_0180': 134241,
  },
  {
    tid: '2016',
    '10-19_BE0101N1_0180': 121839,
    '20-29_BE0101N1_0180': 144438,
    '30-39_BE0101N1_0180': 777526,
    '40-49_BE0101N1_0180': 235047,
  },
  {
    tid: '2017',
    '10-19_BE0101N1_0180': 603267,
    '20-29_BE0101N1_0180': 732271,
    '30-39_BE0101N1_0180': 877909,
    '40-49_BE0101N1_0180': 135659,
  },
  {
    tid: '2018',
    '10-19_BE0101N1_0180': 100336,
    '20-29_BE0101N1_0180': 136108,
    '30-39_BE0101N1_0180': 175307,
    '40-49_BE0101N1_0180': 134241,
  },
  {
    tid: '2019',
    '10-19_BE0101N1_0180': 123839,
    '20-29_BE0101N1_0180': 16738,
    '30-39_BE0101N1_0180': 177526,
    '40-49_BE0101N1_0180': 135047,
  },
  {
    tid: '2020',
    '10-19_BE0101N1_0180': 103267,
    '20-29_BE0101N1_0180': 132271,
    '30-39_BE0101N1_0180': 198909,
    '40-49_BE0101N1_0180': 545659,
  },
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

      <LineChart width={600} height={300} data={dummyData} syncId={"anyId"}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="tid" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" name='Age Group 10-19' dataKey="10-19_BE0101N1_0180" stroke="blue" />
        <Line type="monotone" name='Age Group 20-29' dataKey="20-29_BE0101N1_0180" stroke="red" />
        <Line type="monotone" name='Age Group 30-39' dataKey="30-39_BE0101N1_0180" stroke="green" />
        <Line type="monotone" name='Age Group 40-49' dataKey="40-49_BE0101N1_0180" stroke="black" />
        <Brush
          dataKey="tid"
          height={30}
          stroke="#8884d8"
          travellerWidth={20}
        ></Brush>

      </LineChart>
      <BarChart
        width={600}
        height={300}
        data={dummyData}
        syncId={"anyId"}
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
        <Bar type="" name="Age group 10-19" dataKey="10-19_BE0101N1_0180" fill="blue" />
        <Bar type="monotone" name="Age group 20-29" dataKey="20-29_BE0101N1_0180" fill="red" />
        <Bar type="monotone" name="Age group 30-39" dataKey="30-39_BE0101N1_0180" fill="green" />
        <Bar type="monotone" name="Age group 40-49" dataKey="40-49_BE0101N1_0180" fill="black" />
      </BarChart>
    </>
  );
}
