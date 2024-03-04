import React from 'react';
// @ts-ignore
import * as smileImg from '../images/microbit_smile.png';
// @ts-ignore
import * as flatImg from '../images/microbit_poker.png';
import { withStyles, Theme } from '@material-ui/core/styles';
import { WithStyles } from '@material-ui/core';

const styles = (theme: Theme) => ({
  image: {
    marginTop: 80,
    width: 400,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      marginTop: 120
    }
  }
});

interface Props extends WithStyles<typeof styles> {
  isSmileFace: boolean;
}

const WebhubImage: React.FunctionComponent<Props> = ({
  classes,
  isSmileFace
}) => {
  function getImage() {
    if (isSmileFace) {
      return smileImg;
    }

    return flatImg;
  }
  return <img alt="" src={getImage()} className={classes.image} />;
};

export default withStyles(styles)(WebhubImage);
