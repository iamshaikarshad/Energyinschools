import React from 'react';

import { ArgumentAxis, Legend } from '@devexpress/dx-react-chart-material-ui';
import { withStyles } from '@material-ui/core/styles/index';


const styles = theme => ({
  axisLabel: {
    fontWeight: 'bold',
    transform: 'translate(0, 5px)',
    fontSize: 16,
    [theme.breakpoints.up('xl')]: {
      fontSize: 18,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
  legendRoot: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
  },
  legendItem: {
    padding: 0,
    width: 'auto',
    [theme.breakpoints.down('xs')]: {
      left: '2%',
    },
  },
});

export const ArgumentAxisLabelComponent = withStyles(styles)(({ classes, ...restProps }) => {
  const newProps = { ...restProps, text: '' };
  switch (restProps.text) {
    case '0': newProps.text = '00'; break;
    case '6': newProps.text = '03'; break;
    case '12': newProps.text = '06'; break;
    case '18': newProps.text = '09'; break;
    case '24': newProps.text = '12'; break;
    case '30': newProps.text = '15'; break;
    case '36': newProps.text = '18'; break;
    case '42': newProps.text = '21'; break;
    case '48': newProps.text = '00'; break;
    default: break;
  }

  return newProps.text ? (
    <ArgumentAxis.Label {...newProps} className={classes.axisLabel} />
  ) : null;
});

// eslint-disable-next-line react/prop-types
export const LegendMarker = ({ color }) => (color === '#00000000' ? null : (
  <svg width={20} height={10} style={{ marginLeft: 16 }}>
    <line x1="0" y1="0" x2="20" y2="0" style={{ stroke: color, strokeWidth: 10 }} />
  </svg>
));

export const LegendRoot = withStyles(styles)(({ classes, ...restProps }) => (
  <Legend.Root {...restProps} className={classes.legendRoot} />
));

export const LegendItem = withStyles(styles)(({ classes, ...restProps }) => (
  <Legend.Item {...restProps} className={classes.legendItem} />
));
