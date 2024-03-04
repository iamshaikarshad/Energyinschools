import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';

import ProjectsAndActivitiesCard from './ProjectsAndActivitiesCard';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: 'rgb(255, 255, 255)',
  },
  categoriesContainer: {
    paddingBottom: 80,
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: {
      padding: '10px 0',
    },
  },
  mobileCategoriesWrapper: {
    '@media (max-width:1400px)': {
      justifyContent: 'center',
    },
  },
  header: {
    margin: '1.2em 0',
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 36,
    color: 'rgb(0,0,0)',
    width: '100%',
    letterSpacing: -1,
    [theme.breakpoints.down('xs')]: {
      margin: '0.5em 0',
    },
  },
  categoryCardWrapper: {
    maxWidth: '100%',
    [theme.breakpoints.down('xs')]: {
      margin: 0,
    },
  },
});

class ProjectsAndActivities extends React.PureComponent {
  render() {
    const {
      cards, classes, downloadMaterials, showMessageSnackbar,
    } = this.props;

    return (
      <div className={classes.root}>
        <Grid container className={classes.categoriesContainer} justify="center">
          <Grid item container xs={10} md={9} justify="space-between" className={classes.mobileCategoriesWrapper}>
            <h1 className={classes.header}>Projects and activities</h1>
            {cards.map((card) => {
              const {
                id, title, overview, group_avatar: avatar, materials,
              } = card;

              return (
                <Grid key={id} item container lg={4} md={5} sm={6} spacing={2} className={classes.categoryCardWrapper}>
                  <ProjectsAndActivitiesCard
                    avatar={avatar}
                    title={title}
                    description={overview}
                    materials={materials}
                    downloadMaterials={downloadMaterials}
                    showMessageSnackbar={showMessageSnackbar}
                  />
                </Grid>
              );
            })
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

ProjectsAndActivities.propTypes = {
  classes: PropTypes.object.isRequired,
  cards: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  downloadMaterials: PropTypes.func.isRequired,
  showMessageSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles)(ProjectsAndActivities);
