import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty } from 'lodash';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    height: '100%',
  },
  sliderRoot: {
    padding: '18px 20px !important',
    [theme.breakpoints.up('xl')]: {
      padding: '36px 40px !important',
    },
  },
  messageBlock: {
    fontSize: '24px !important',
    padding: '8px 0px !important',
    lineHeight: '1.2 !important',
    [theme.breakpoints.up('xl')]: {
      fontSize: '32px !important',
    },
  },
  messageBlockWrapper: {},
});

const PreviewComponent = ({ classes, previewMessages, sliderComponent }) => {
  if (isEmpty(previewMessages)) return null;
  return (
    <Grid container className={classes.root}>
      {React.createElement(
        sliderComponent,
        {
          previewMessages,
          classes: {
            root: classes.sliderRoot,
            messageBlockWrapper: classes.messageBlockWrapper,
            messageBlock: classes.messageBlock,
          },
        },
        null,
      )}
    </Grid>
  );
};

PreviewComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  previewMessages: PropTypes.array.isRequired,
  sliderComponent: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.object, // need it to avoid warning when using react lazy
  ]).isRequired,
};

export default withStyles(styles)(PreviewComponent);
