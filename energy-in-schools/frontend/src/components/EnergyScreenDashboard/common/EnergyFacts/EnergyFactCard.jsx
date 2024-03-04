import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    minWidth: '300px',
    width: '100%',
  },
  numbersImg: {
    height: 50,
    width: 50,
    display: 'block',
    [mlSreenSizeMediaQuery.up]: {
      height: 100,
      width: 100,
    },
  },
  listItemText: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 600,
    opacity: 0.9,
    lineHeight: 1.7,
    fontSize: 21,
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 28,
    },
  },
  listItemContent: {
    padding: '0px 16px',
  },
});

const PaperSheet = ({
  classes, factText, indexNum, indexNumImg,
}) => (
  <ListItem key={indexNum} dense>
    <Avatar alt={String(indexNum)} src={indexNumImg} className={classes.numbersImg} />
    <ListItemText primary={factText} classes={{ root: classes.listItemContent, primary: classes.listItemText }} />
  </ListItem>
);

PaperSheet.propTypes = {
  classes: PropTypes.object.isRequired,
  factText: PropTypes.string.isRequired,
  indexNum: PropTypes.number,
  indexNumImg: PropTypes.string,
};

PaperSheet.defaultProps = {
  indexNum: 1,
  indexNumImg: '',
};

export default withStyles(styles)(PaperSheet);
