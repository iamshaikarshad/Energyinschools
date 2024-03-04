import React from 'react';
import PropTypes from 'prop-types';

const ShapedVerticalBar = (props) => {
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

ShapedVerticalBar.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string,
};

ShapedVerticalBar.defaultProps = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  fill: 'rgb(0, 188, 212)',
};

export default ShapedVerticalBar;
