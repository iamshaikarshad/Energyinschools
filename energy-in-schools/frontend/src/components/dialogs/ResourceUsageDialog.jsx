import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { withStyles } from '@material-ui/core/styles/index';
import withMobileDialog from '@material-ui/core/withMobileDialog';

import { isEmpty } from 'lodash';

import UsageStatistic from '../../containers/UsageStatistic';

const styles = theme => ({
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginBottom: theme.spacing(1),
  },
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '20px auto',
    textAlign: 'center',
  },
  dialogContent: {
    padding: 0,
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 15,
  },
  resourceIcon: {
    width: 30,
    height: 35,
  },
});

const DIALOG_TIMEOUT = 500;

const Transition = React.forwardRef((props, ref) => (<Slide ref={ref} direction="up" {...props} mountOnEnter unmountOnExit timeout={DIALOG_TIMEOUT} />));

const ResourceUsageDialog = (props) => {
  const {
    classes,
    fullScreen,
    title,
    isOpened,
    onClose,
    resource,
    chartConfig,
    titleIcon,
  } = props;

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      open={isOpened}
      onClose={onClose}
      aria-labelledby="resource-usage-dialog-title"
      TransitionComponent={Transition}
    >
      <DialogTitle id="resource-usage-dialog-title" style={{ padding: 0 }} disableTypography>
        <div className={classes.titleBlock}>
          <img src={titleIcon} alt="resource" className={classes.resourceIcon} />
          <Typography variant="h6" className={classes.dialogTitle}>{title}</Typography>
          <IconButton color="inherit" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />
      </DialogTitle>
      <DialogContent classes={{ root: classes.dialogContent }}>
        {!isEmpty(resource) && (
          <UsageStatistic config={chartConfig} resource={resource} />
        )}
      </DialogContent>
    </Dialog>
  );
};

ResourceUsageDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  fullScreen: PropTypes.bool.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  titleIcon: PropTypes.string,
  resource: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  chartConfig: PropTypes.object,
};

ResourceUsageDialog.defaultProps = {
  resource: null,
  chartConfig: {},
  title: '',
  titleIcon: '',
};

export default compose(
  withStyles(styles),
  withMobileDialog(),
)(ResourceUsageDialog);
