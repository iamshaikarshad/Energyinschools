import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import {
  Grid,
  withStyles,
  Slider,
} from '@material-ui/core';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { SELECTED_BUTTON_COLOR } from './constants';

import { SENSOR_TYPE_LABEL, UNIT_TO_LABEL_MAP } from '../../constants/config';

const styles = theme => ({
  mainWrapper: {
    paddingTop: 25,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  firstChart: {
    position: 'relative',
    width: 'calc(100% - 30px)',
    paddingRight: 32,
    paddingBottom: 25,
    [theme.breakpoints.down('sm')]: {
      paddingRight: 48,
    },
  },
  secondChart: {
    position: 'absolute',
    width: 'calc(100% - 30px)',
    paddingLeft: 64,
  },
  legendWrapper: {
    position: 'absolute',
    display: 'flex',
    maxWidth: '50%',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: '30px',
    listStyleType: 'none',
  },
  legendItem: {
    marginLeft: 40,
    fontSize: 24,
    marginBottom: 6,
  },
  straightLegendItem: {
    '&:before': {
      content: '"\\2012\\25CF"',
      position: 'absolute',
      marginLeft: -33,
      marginTop: 2,
    },
  },
  dashedLegendItem: {
    '&:before': {
      content: '"--\\25CF"',
      position: 'absolute',
      marginLeft: -33,
      marginTop: 2,
    },
  },

});

const StyledSliderY1 = withStyles({
  root: {
    left: '10px',
    top: '14px',
    zIndex: 12,
    width: 3,
    position: 'absolute',
    '&$vertical': {
      width: 8,
      height: 'calc(100% - 77px)',
    },
  },
  thumb: {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    marginTop: -12,
    marginLeft: -13,
    boxShadow: '#ebebeb 0 2px 2px',
    '&:focus, &:hover, &$active': {
      boxShadow: '#ccc 0 2px 3px 1px',
    },
    '& .bar': {
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  active: {},
  track: {
    height: 3,
  },
  valueLabel: {
    left: -4,
    textAlign: 'center',
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 3,
  },
  vertical: {
    '& $rail': {
      width: 3,
    },
    '& $track': {
      width: 3,
    },
    '& $thumb': {
      marginLeft: -12,
      marginBottom: -11,
    },
  },
})(Slider);

const StyledSliderY2 = withStyles({
  root: {
    left: 'calc(100% - 32px)',
    top: '14px',
    zIndex: 12,
    width: 3,
    position: 'absolute',
    '&$vertical': {
      width: 8,
      height: 'calc(100% - 50px)',
    },
  },
  thumb: {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    marginTop: -12,
    marginLeft: -13,
    boxShadow: '#ebebeb 0 2px 2px',
    '&:focus, &:hover, &$active': {
      boxShadow: '#ccc 0 2px 3px 1px',
    },
    '& .bar': {
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  active: {},
  track: {
    height: 3,
  },
  valueLabel: {
    left: -4,
    textAlign: 'center',
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 3,
  },
  vertical: {
    '& $rail': {
      width: 3,
    },
    '& $track': {
      width: 3,
    },
    '& $thumb': {
      marginLeft: -12,
      marginBottom: -11,
    },
  },
})(Slider);

const StyledSliderX = withStyles({
  root: {
    color: SELECTED_BUTTON_COLOR,
    height: 3,
    position: 'absolute',
    left: '86px',
    width: 'calc(100% - 149px)',
    top: '506px',
  },

  thumb: {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    marginTop: -12,
    marginLeft: -13,
    boxShadow: '#ebebeb 0 2px 2px',
    '&:focus, &:hover, &$active': {
      boxShadow: '#ccc 0 2px 3px 1px',
    },
    '& .bar': {
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  active: {},
  track: {
    height: 3,
  },
  valueLabel: {
    left: -4,
    textAlign: 'center',
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 3,
  },
})(Slider);

class SensorsChart extends PureComponent {
  state = {
    rangeX: [],
    rangeY1: [],
    rangeY2: [],
  }

  componentDidMount = () => {
    const { chartDataRange } = this.props;
    const {
      minX,
      maxX,
      minY1,
      maxY1,
      minY2,
      maxY2,
    } = chartDataRange;
    this.setState({
      rangeX: [minX, maxX],
      rangeY1: [minY1, maxY1],
      rangeY2: [minY2, maxY2],
    });
  }

  componentDidUpdate = (prevProps) => {
    const { chartDataRange } = this.props;
    if (prevProps.chartDataRange !== chartDataRange) {
      const {
        minX,
        maxX,
        minY1,
        maxY1,
        minY2,
        maxY2,
      } = chartDataRange;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        rangeX: [minX, maxX],
        rangeY1: [minY1, maxY1],
        rangeY2: [minY2, maxY2],
      });
    }
  }

  handleChangeSliderX = (event, newValue) => {
    this.setState({ rangeX: newValue });
  }

  handleChangeSliderY1 = (event, newValue) => {
    this.setState({ rangeY1: newValue });
  }

  handleChangeSliderY2 = (event, newValue) => {
    this.setState({ rangeY2: newValue });
  }

  downSampleData = (data, groupName, threshold) => {
    if (threshold >= data.length || threshold === 0) {
      return data;
    }
    const sampled = [];
    let sampledIndex = 0;
    const every = (data.length - 2) / (threshold - 2);
    let a = 0,
      maxAreaPoint,
      maxArea,
      area,
      nextA;

    // eslint-disable-next-line no-plusplus
    sampled[sampledIndex++] = data[a];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < threshold - 2; i++) {
      let avgX = 0,
        avgY = 0,
        avgRangeStart = Math.floor((i + 1) * every) + 1,
        avgRangeEnd = Math.floor((i + 2) * every) + 1;
      avgRangeEnd = avgRangeEnd < data.length ? avgRangeEnd : data.length;

      const avgRangeLength = avgRangeEnd - avgRangeStart;

      // eslint-disable-next-line no-plusplus
      for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
        const { timestamp, [groupName]: groupValue } = data[avgRangeStart];
        avgX += timestamp;
        avgY += groupValue;
      }

      avgX /= avgRangeLength;
      avgY /= avgRangeLength;

      let rangeOffs = Math.floor((i + 0) * every) + 1;
      const rangeTo = Math.floor((i + 1) * every) + 1;
      const { timestamp, [groupName]: groupValue } = data[a];
      const pointAx = timestamp,
        pointAy = groupValue;
      // eslint-disable-next-line no-multi-assign
      maxArea = area = -1;

      // eslint-disable-next-line no-plusplus
      for (; rangeOffs < rangeTo; rangeOffs++) {
        const { timestamp: timestampRangeOffs, [groupName]: groupValueRangeOffs } = data[rangeOffs];
        area = Math.abs(
          (pointAx - avgX) * (groupValueRangeOffs - pointAy) - (pointAx - timestampRangeOffs) * (avgY - pointAy),
        ) * 0.5;
        if (area > maxArea) {
          maxArea = area;
          maxAreaPoint = data[rangeOffs];
          nextA = rangeOffs;
        }
      }
      // eslint-disable-next-line no-plusplus
      sampled[sampledIndex++] = maxAreaPoint;
      a = nextA;
    }
    // eslint-disable-next-line no-plusplus
    sampled[sampledIndex++] = data[data.length - 1];
    return sampled;
  };

  getChartDataRange = (chartDataTypes) => {
    const { rangeX: [min, max], rangeY1: [minY1, maxY1], rangeY2: [minY2, maxY2] } = this.state;
    const compressedData = chartDataTypes.map((chartData, index) => {
      const filteredXdata = JSON.parse(JSON.stringify(chartData.filter(data => min <= data.timestamp && data.timestamp <= max)));
      const filteredData = filteredXdata.reduce((acc, data) => {
        const resultData = { ...data };
        let range = {};
        if (!index) {
          range = { min: minY1, max: maxY1 };
        } else {
          range = { min: minY2, max: maxY2 };
        }
        Object.keys(resultData).forEach((key) => {
          if (key !== 'timestamp' && !(range.min <= resultData[key] && resultData[key] <= range.max)) {
            resultData[key] = null;
          }
        });
        if (Object.values(resultData).filter(elem => elem !== null).length > 1) {
          acc.push(resultData);
        }
        return acc;
      }, []);
      const groupedData = filteredData.reduce((acc, data) => {
        Object.keys(data).forEach((key) => {
          if (data[key] !== null && key !== 'timestamp') {
            const { timestamp, [key]: value } = data;
            if (key in acc) {
              acc[key].push({ timestamp, [key]: value });
            } else {
              acc[key] = [{ timestamp, [key]: value }];
            }
          }
        });
        return acc;
      }, {});
      const compressedGroups = Object.keys(groupedData).reduce((acc, groupName) => {
        acc.push(...this.downSampleData(groupedData[groupName], groupName, 50));
        return acc;
      }, []);
      return compressedGroups;
    });
    const result = compressedData.map((chartData, index) => {
      const data = chartData.reduce((acc, sensor) => {
        acc[sensor.timestamp] = { ...acc[sensor.timestamp], ...sensor };
        return acc;
      }, {});
      if (compressedData.length > 1) {
        compressedData[(index + 1) % 2].forEach((sensor) => {
          if (!(sensor.timestamp in data)) {
            data[sensor.timestamp] = { timestamp: sensor.timestamp };
          }
        });
      }
      return Object.values(data);
    });
    return result;
  }

  valueLabelFormat = (value) => {
    const time = moment.unix(value).format('HH:mm:ss');
    const date = moment.unix(value).format('MMM-DD');
    return `${time}\n${date}`;
  }

  render() {
    const {
      classes,
      chartData,
      sensorTypesToDisplay,
      chartDataRange,
      availableGroupNames,
      excludedSensors,
    } = this.props;
    const { rangeX, rangeY1, rangeY2 } = this.state;
    const displayedDates = [];
    const groupCount = Math.max(...availableGroupNames.map(item => item.length));
    const groupNames = availableGroupNames.reduce((acc, name) => {
      acc.push(...name);
      return [...new Set(acc)];
    }, []);


    const palette = groupNames.reduce((acc, sensor, index) => {
      const unselectedMicrobit = excludedSensors.includes(sensor);
      acc[sensor] = `hsla(${(340 / groupCount) * index}, 100%, 50%, ${unselectedMicrobit ? 0.5 : 1})`;
      return acc;
    }, {});

    const filteredChartData = chartData.map(array => array.reduce((acc, data) => {
      const obj = {};
      Object.keys(data).forEach((el) => {
        if (!excludedSensors.includes(el)) {
          obj[el] = data[el];
        }
      });
      acc.push(obj);
      return acc;
    }, []));
    const dataToDisplay = this.getChartDataRange(filteredChartData);

    return (
      <Grid container className={classes.mainWrapper}>
        {sensorTypesToDisplay.map((type, index) => (
          <Grid
            container
            className={!index ? classes.firstChart : classes.secondChart}
            style={{ color: 'black' }}
            key={`${type}_chart`}
          >
            { !index ? (
              <React.Fragment>
                <StyledSliderX
                  min={chartDataRange.minX}
                  max={chartDataRange.maxX}
                  value={rangeX}
                  valueLabelDisplay="auto"
                  valueLabelFormat={this.valueLabelFormat}
                  onChange={this.handleChangeSliderX}
                />
                <StyledSliderY1
                  min={chartDataRange.minY1}
                  max={chartDataRange.maxY1}
                  value={rangeY1}
                  valueLabelDisplay="auto"
                  onChange={this.handleChangeSliderY1}
                  orientation="vertical"
                />
              </React.Fragment>
            ) : (
              <StyledSliderY2
                min={chartDataRange.minY2}
                max={chartDataRange.maxY2}
                value={rangeY2}
                valueLabelDisplay="auto"
                onChange={this.handleChangeSliderY2}
                orientation="vertical"
              />
            )}
            <ResponsiveContainer
              minHeight={500}
            >
              <LineChart
                data={dataToDisplay[index]}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  domain={['dataMin', 'dataMax']}
                  axisLine={false}
                  tick={({
                    x, y, index: tickIndex, payload: { value: tick },
                  }) => {
                    if (index) {
                      return null;
                    }
                    let showDate = '';
                    const time = moment.unix(tick).format('HH:mm:ss');
                    const date = moment.unix(tick).format('YYYY-MM-DD');
                    const foundDate = displayedDates.find(({ date: currentDate }) => date === currentDate);
                    if (!foundDate) {
                      displayedDates.push({ tickIndex, date });
                      showDate = date;
                    } else if (foundDate.tickIndex === tickIndex) {
                      showDate = date;
                    }
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={10} fill="#666">
                          <tspan textAnchor="middle" x="0">{time}</tspan>
                          <tspan textAnchor="middle" x="0" y="25">{tick === rangeX[1] ? date : showDate}</tspan>
                        </text>
                      </g>
                    );
                  }}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  tick={{ fill: 'black' }}
                  tickFormatter={tick => `${tick} ${type === SENSOR_TYPE_LABEL.TEMPERATURE ? UNIT_TO_LABEL_MAP.celsius : ''}`}
                  orientation={!index ? 'left' : 'right'}
                  axisLine={false}
                  width={64}
                  domain={[type === 'temperature' ? 0 : 'dataMin', 'dataMax']}
                />
                <Legend
                  content={(props) => {
                    const { payload } = props;
                    return (
                      <ul className={classes.legendWrapper} style={index ? { left: 'calc(50% - 60px)', top: 20 } : { top: 20 }}>
                        <span style={{ fontWeight: 'bold' }}>{type} ({!index ? 'left y axis' : 'right y axis'}):</span>
                        {
                          payload.map((entry) => {
                            const unselectedMicrobit = excludedSensors.includes(entry.value);
                            return (
                              <li
                                key={`item-${entry.value}`}
                                className={`${classes.legendItem} ${!index ? classes.straightLegendItem : classes.dashedLegendItem}`}
                                style={{ color: entry.color }}
                              >
                                <span style={{ color: 'black', fontSize: 14, opacity: unselectedMicrobit ? 0.3 : 1 }}>{entry.value}</span>
                              </li>
                            );
                          })
                        }
                      </ul>
                    );
                  }}
                />
                {availableGroupNames[index].map(groupName => (
                  <Line
                    connectNulls
                    key={groupName}
                    type="linear"
                    dataKey={groupName}
                    stroke={palette[groupName]}
                    fill={palette[groupName]}
                    strokeWidth={4}
                    strokeDasharray={index ? '8 3' : ''}
                  />
                ))};
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        ))}
      </Grid>
    );
  }
}

SensorsChart.propTypes = {
  chartData: PropTypes.array,
  chartDataRange: PropTypes.object,
  classes: PropTypes.object.isRequired,
  sensorTypesToDisplay: PropTypes.array,
  availableGroupNames: PropTypes.array,
  excludedSensors: PropTypes.array,
};

SensorsChart.defaultProps = {
  chartData: [],
  availableGroupNames: [],
  chartDataRange: {},
  sensorTypesToDisplay: [],
  excludedSensors: [],
};

export default withStyles(styles)(SensorsChart);
