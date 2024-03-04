import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { NEW_PRIMARY_COLOR } from '../../styles/stylesConstants';

const styles = theme => ({
  allMaterialsTitle: {
    color: NEW_PRIMARY_COLOR,
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 21,
    margin: 0,
  },
  button: {
    width: 160,
    height: 32,
    padding: '5px 10px 2px',
    borderRadius: 16,
    textTransform: 'none',
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 'normal',
    boxShadow: 'none',
    borderColor: `${NEW_PRIMARY_COLOR}e6`,
    '&:hover': {
      borderColor: NEW_PRIMARY_COLOR,
    },
    '&:active': {
      borderColor: NEW_PRIMARY_COLOR,
      boxShadow: 'none',
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 5,
      width: '100%',
    },
  },
  allMaterialsButton: {
    color: `${NEW_PRIMARY_COLOR}e6`,
    '&:hover': {
      color: NEW_PRIMARY_COLOR,
    },
  },
  lessonPartButton: {
    backgroundColor: NEW_PRIMARY_COLOR,
    '&:hover': {
      backgroundColor: `${NEW_PRIMARY_COLOR}e6`,
    },
  },
  lessonPartTitle: {
    color: NEW_PRIMARY_COLOR,
    margin: 0,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'SamsungSharpSans',
  },
  lessonPartDescription: {
    margin: 0,
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: 'SamsungOne',
  },
});

class LessonPart extends React.PureComponent {
  render() {
    const {
      classes, headerRow, title, description, materials, downloadMaterials, energyChampionsResource,
    } = this.props;

    return (
      <Grid container justify="space-between" style={headerRow ? { marginBottom: 10 } : { marginTop: 20 }}>
        <Grid item xs={12} sm={7} md={8} lg={10} styles={headerRow ? {} : { paddingRight: 20 }}>
          {headerRow ? (
            <h2 className={classes.allMaterialsTitle}>
              {energyChampionsResource ? 'Activities' : 'Lessons'}
            </h2>
          ) : (
            <React.Fragment>
              <h4 className={classes.lessonPartTitle}>{title}</h4>
              <p className={classes.lessonPartDescription}>{description}</p>
            </React.Fragment>
          )}
        </Grid>
        <Grid item container xs={12} sm={5} md={4} lg={2} justify="flex-end">
          <Button
            fullWidth
            variant={headerRow ? 'outlined' : 'contained'}
            color="primary"
            onClick={() => { downloadMaterials(materials); }}
            className={`${classes.button} ${headerRow ? classes.allMaterialsButton : classes.lessonPartButton}`}
          >
            {headerRow ? `Download all ${energyChampionsResource ? 'activities' : 'resources'}` : 'Download materials'}
          </Button>
        </Grid>
      </Grid>
    );
  }
}

LessonPart.propTypes = {
  classes: PropTypes.object.isRequired,
  materials: PropTypes.string.isRequired,
  downloadMaterials: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  energyChampionsResource: PropTypes.bool,
  headerRow: PropTypes.bool,
  description: PropTypes.string,
};

LessonPart.defaultProps = {
  headerRow: false,
  energyChampionsResource: false,
  description: '',
};

export default withStyles(styles)(LessonPart);
