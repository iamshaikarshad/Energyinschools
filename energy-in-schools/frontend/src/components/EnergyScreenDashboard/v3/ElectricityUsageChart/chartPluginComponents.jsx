import React from 'react';
import { symbol, symbolSquare } from 'd3-shape';

import {
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  Legend,
  Title,
  ScatterSeries,
} from '@devexpress/dx-react-chart-material-ui';
import { withStyles } from '@material-ui/core/styles/index';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

import cloud from '../../../../images/Dashboard_V2_Arts/carbon_message_cloud_bg.svg';
import { MIDDAY_OF } from '../../constants';

const styles = theme => ({
  chartTitle: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 1.61,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 35,
    },
  },
  axisLabel: {
    fontWeight: 'bold',
    transform: 'translate(0, 5px)',
    fontSize: 16,
    [theme.breakpoints.up('xl')]: {
      fontSize: 18,
    },
  },
  lineSeries: {
    strokeWidth: 5,
  },
  legendRoot: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
  },
  legendItem: {
    padding: 0,
    width: 'auto',
  },
});

export const TitleTextComponent = withStyles(styles)(({ classes, ...restProps }) => (
  <Title.Text {...restProps} className={classes.chartTitle} />
));

export const ArgumentAxisLabelComponent = withStyles(styles)(({ classes, ...restProps }) => {
  const newProps = { ...restProps, text: '' };

  switch (restProps.text) {
    case `${MIDDAY_OF.Monday}`: newProps.text = 'Monday'; break;
    case `${MIDDAY_OF.Tuesday}`: newProps.text = 'Tuesday'; break;
    case `${MIDDAY_OF.Wednesday}`: newProps.text = 'Wednesday'; break;
    case `${MIDDAY_OF.Thursday}`: newProps.text = 'Thursday'; break;
    case `${MIDDAY_OF.Friday}`: newProps.text = 'Friday'; break;
    default: break;
  }

  return newProps.text ? (
    <ArgumentAxis.Label {...newProps} className={classes.axisLabel} />
  ) : null;
});

export const ValueAxisLabelComponent = withStyles(styles)(({ classes, ...restProps }) => (
  <ValueAxis.Label {...restProps} className={classes.axisLabel} />
));

export const LineSeriesComponent = withStyles(styles)(({ classes, ...restProps }) => (
  <LineSeries.Path {...restProps} className={classes.lineSeries} />
));

export const LegendRoot = withStyles(styles)(({ classes, ...restProps }) => (
  <Legend.Root {...restProps} className={classes.legendRoot} />
));

export const LegendItem = withStyles(styles)(({ classes, ...restProps }) => (
  <Legend.Item {...restProps} className={classes.legendItem} />
));

// eslint-disable-next-line react/prop-types
export const LegendMarker = ({ color }) => (color === '#00000000' ? null : (
  <svg width={20} height={10} style={{ marginLeft: 16 }}>
    <line x1="0" y1="0" x2="20" y2="0" style={{ stroke: color, strokeWidth: 10 }} />
  </svg>
));

export const AnimalMarker = ({
  // eslint-disable-next-line react/prop-types
  above, marker, firstRow, secondRow, ...props
}) => (
  <React.Fragment>
    <LineSeries.Path {...props} />
    <ScatterSeries.Path
      {...props}
      pointComponent={({ arg, val, value }) => (
        <React.Fragment>
          <defs>
            <pattern id={`marker${+above}`} patternUnits="userSpaceOnUse" x="20" y="20" width="40" height="40">
              <image
                href={marker}
                x="0"
                y="0"
                width="40"
                height="40"
              />
            </pattern>
            <pattern id="bubble" patternUnits="userSpaceOnUse" x="0" y="70" width="140" height="90">
              <image
                opacity={0.7}
                href={cloud}
                x="0"
                y="0"
                width="140"
                height="90"
              />
            </pattern>
          </defs>
          <g
            transform={`translate(${above ? arg - 70 : arg - 70} ${above ? val - 72 : val + 22})`}
          >
            <rect
              fill="url(#bubble)"
              width="140"
              height="50"
            />
            <text
              style={{
                fontFamily: DASHBOARD_FONTS.primary,
                fontSize: 13,
              }}
              x="65"
              alignmentBaseline="middle"
              textAnchor="middle"
              transform="translate(5 16)"
            >
              &#163;{Math.round((value + Number.EPSILON) * 100) / 100} {firstRow}
            </text>
            <text
              style={{
                fontFamily: DASHBOARD_FONTS.primary,
                fontSize: 13,
              }}
              x="65"
              alignmentBaseline="middle"
              textAnchor="middle"
              transform="translate(5 36)"
            >
              {secondRow}
            </text>
          </g>
          <path
            fill={`url(#marker${+above})`}
            transform={`translate(${arg} ${val})`}
            d={symbol()
              .size([40 ** 2])
              .type(symbolSquare)()}
          />
        </React.Fragment>
      )}
    />
  </React.Fragment>
);
