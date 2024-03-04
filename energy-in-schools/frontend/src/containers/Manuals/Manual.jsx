import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AttachFile from '@material-ui/icons/AttachFile';
import Divider from '@material-ui/core/Divider';
import { isEmpty } from 'lodash';
import * as markdownIt from 'markdown-it';

import * as manualsActions from '../../actions/manualsActions';
import * as dialogActions from '../../actions/dialogActions';
import NotFoundPage from '../../components/NotFoundPage';

const styles = theme => ({

  root: {
    width: '100%',
    marginBottom: theme.spacing(4),
    borderRadius: 5,
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      borderRadius: 0,
      marginBottom: theme.spacing(1),
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
    },
  },

  manualTitle: {
    fontSize: 28,
    fontWeight: 600,
    fontFamily: 'Roboto, Helvetica',
    color: 'rgb(0, 188, 212)',
    padding: '32px 24px',
    width: '100%',
    textTransform: 'uppercase',
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      fontSize: 24,
      padding: 24,
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 21,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
      padding: 16,
    },
  },

  manualBody: {
    width: '100%',
    fontSize: 21,
    fontWeight: 400,
    fontFamily: 'Roboto, Helvetica',
    lineHeight: 2,
    marginLeft: 20,
    marginRight: 20,
    '&>video': { // top-level videos are horizontally centered and fit the page width
      display: 'block',
      maxWidth: '100%',
      margin: '0px auto',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },

  attachments: {
    fontSize: 24,
    fontFamily: 'Roboto, Helvetica',
    marginTop: 15,
    fontWeight: 500,
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
      marginTop: 10,
    },
  },

  attachment: {
    color: 'rgb(0, 188, 212)',
    marginTop: 10,
  },

  attachFileIcon: {
    fontSize: 20,
    color: 'inherit',
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
    },
  },

  attachmentTitle: {
    height: 20,
    maxWidth: '100%',
    fontSize: 16,
    fontFamily: 'Roboto, Helvetica',
    paddingLeft: 4,
    color: 'inherit',
    cursor: 'pointer',
    outline: 'none !important',
    border: 'none !important',
    textAlign: 'left',
    backgroundColor: 'transparent !important',
    [theme.breakpoints.down('sm')]: {
      fontSize: 14,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
    },
  },
});

const md = markdownIt({ html: true });

const createMarkup = templateString => ({ __html: md.render(templateString) });

class Manual extends React.Component {
  state = {
    loading: true, // need it to prevent rendering old data from store
  }

  componentDidMount() {
    const { actions, match: { params: { manualSlug } } } = this.props;
    actions.getManual(manualSlug)
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  downloadPresentation = (url, fileName) => () => {
    const { actions } = this.props;
    actions.downloadManualPresentation(url, fileName);
  };

  render() {
    const { loading } = this.state;

    if (loading) return null;

    const { classes, manual } = this.props;

    const manualData = manual.data;

    const manualAttachments = manualData.attachments;

    return (
      <div style={{
        width: '100%',
        backgroundColor: 'rgb(255, 255, 255)',
        backgroundImage: 'linear-gradient(to bottom, rgb(255, 255, 255), rgba(0, 150, 212, 0.1) 90%, rgba(147, 212, 242, 0.2))',
      }}
      >
        { !isEmpty(manualData) ? (
          <Grid item container xs={12} className={classes.root}>
            <Grid item container xs={11} sm={10}>
              <Typography className={classes.manualTitle}>
                {manualData.title}
              </Typography>
              {/* eslint-disable react/no-danger */}
              <div className={classes.manualBody} dangerouslySetInnerHTML={createMarkup(manualData.body)} />
              { !isEmpty(manualAttachments) && (
                <div>
                  <Divider component="div" style={{ width: '100%' }} />
                  <Typography className={classes.attachments}>
                    Attachments
                  </Typography>
                  <Grid item container xs={12}>
                    { manualAttachments.map((attachment) => {
                      const attachmentUrl = attachment.url;
                      const attachmentTitle = attachment.file_name;
                      return (
                        <Grid item container xs={10} key={attachmentUrl} className={classes.attachment} wrap="nowrap">
                          <AttachFile className={classes.attachFileIcon} />
                          <Typography
                            component="button"
                            className={classes.attachmentTitle}
                            onClick={this.downloadPresentation(attachmentUrl, attachmentTitle)}
                            onKeyPress={this.downloadPresentation(attachmentUrl, attachmentTitle)}
                            role="button"
                            tabIndex={-1}
                          >
                            {attachmentTitle}
                          </Typography>
                        </Grid>
                      );
                    })
                    }
                  </Grid>
                </div>
              )
              }
            </Grid>
          </Grid>
        ) : (
          <NotFoundPage />
        )
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    manual: state.manual,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...manualsActions,
      ...dialogActions,
    }, dispatch),
  };
}

Manual.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  manual: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(Manual);
