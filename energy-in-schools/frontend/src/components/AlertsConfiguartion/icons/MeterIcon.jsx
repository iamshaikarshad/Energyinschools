import React from 'react';
import PropTypes from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';

const MeterIcon = ({ colour, ...props }) => (
  <SvgIcon viewBox="0 0 30 39" {...props}>
    <g id="Group_4018" data-name="Group 4018" transform="translate(13.85 13.781)">
      <g id="Group_4017" data-name="Group 4017" transform="translate(0)">
        <path
          fill={colour}
          id="Path_8083"
          data-name="Path 8083"
          className="cls-1"
          d="M242.127,180.925a1.144,1.144,0,1,0,1.15,1.144A1.149,1.149,0,0,0,242.127,180.925Z"
          transform="translate(-240.977 -180.925)"
        />
      </g>
    </g>
    <g id="Group_4020" data-name="Group 4020" transform="translate(4.593 4.571)">
      <g id="Group_4019" data-name="Group 4019" transform="translate(0)">
        <path
          fill={colour}
          id="Path_8084"
          data-name="Path 8084"
          className="cls-1"
          d="M130.463,60A10.355,10.355,0,1,0,140.87,70.359,10.393,10.393,0,0,0,130.463,60Zm3.447,10.355a3.444,3.444,0,1,1-1.961-3.094l1.811-1.8,1.624,1.616-1.811,1.8A3.4,3.4,0,0,1,133.91,70.359Z"
          transform="translate(-120.056 -60.004)"
        />
      </g>
    </g>
    <g id="Group_4022" data-name="Group 4022" transform="translate(0)">
      <g id="Group_4021" data-name="Group 4021" transform="translate(0)">
        <path
          fill={colour}
          id="Path_8085"
          data-name="Path 8085"
          className="cls-1"
          d="M75.053,0a14.917,14.917,0,0,0-4.821,29.06v3.08h9.643V29.06A14.917,14.917,0,0,0,75.053,0Zm0,27.566a12.641,12.641,0,1,1,12.7-12.64A12.686,12.686,0,0,1,75.053,27.566Z"
          transform="translate(-60.053 0)"
        />
      </g>
    </g>
    <g id="Group_4024" data-name="Group 4024" transform="translate(8.646 34.426)">
      <g id="Group_4023" data-name="Group 4023" transform="translate(0)">
        <rect
          fill={colour}
          id="Rectangle_3873"
          data-name="Rectangle 3873"
          className="cls-1"
          width="12.708"
          height="4.574"
        />
      </g>
    </g>
  </SvgIcon>
);

MeterIcon.propTypes = {
  colour: PropTypes.string,
};

MeterIcon.defaultProps = {
  colour: '#fff',
};

export default MeterIcon;
