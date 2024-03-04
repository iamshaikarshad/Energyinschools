import React from 'react';
import PropTypes from 'prop-types';

const BarCell = (props) => {
  const {
    x, y, width, height, fill,
  } = props;

  return (
    <rect
      x={x || 0}
      y={y || 0}
      width={width || 0}
      height={height || 0}
      rx={10}
      ry={10}
      fill={fill}
    />
  );
};

BarCell.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string,
};

BarCell.defaultProps = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  fill: '#00bcd4',
};

export default BarCell;
