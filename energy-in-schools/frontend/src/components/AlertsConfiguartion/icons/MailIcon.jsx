import React from 'react';
import PropTypes from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';

const MailIcon = ({ colour, ...props }) => (
  <SvgIcon viewBox="0 0 38 30" {...props}>
    <g id="mail_dark" transform="translate(-992.573 -864.259)">
      <g id="write-email-envelope-button" transform="translate(992.573 864.259)">
        <g id="mail" transform="translate(0 0)">
          <path
            id="Path_8104"
            fill={colour}
            d="M34.2,51H3.8A3.786,3.786,0,0,0,0,54.75v22.5A3.786,3.786,0,0,0,3.8,81H34.2A3.786,3.786,0,0,0,38,77.25V54.75A3.786,3.786,0,0,0,34.2,51Zm0,7.5L19,67.875,3.8,58.5V54.75L19,64.125,34.2,54.75Z"
            transform="translate(0 -51)"
          />
        </g>
      </g>
    </g>
  </SvgIcon>
);

MailIcon.propTypes = {
  colour: PropTypes.string,
};

MailIcon.defaultProps = {
  colour: '#393939',
};

export default MailIcon;
