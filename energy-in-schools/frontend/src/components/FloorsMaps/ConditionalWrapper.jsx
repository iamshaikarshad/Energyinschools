import React from 'react';
import PropTypes from 'prop-types';

const ConditionalWrapper = ({ condition, wrap, children }) => {
  if (condition) return wrap(children);
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

ConditionalWrapper.propTypes = {
  children: PropTypes.node,
  condition: PropTypes.bool,
  wrap: PropTypes.func.isRequired,
};

ConditionalWrapper.defaultProps = {
  children: null,
  condition: false,
};

export default ConditionalWrapper;
