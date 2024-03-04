import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import LeagueMemberComponent from './LeagueMemberComponent';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

import getOrdinal from '../../../../utils/getOrdinal';

import {
  LEAGUE_MEMBER_POSITION_CONFIG,
  LEAGUE_MEMBER_POSITION_STYLE,
  LEAGUE_TABLE_POINTS_UNIT_LABEL,
  getNameOfLeagueMember,
  getLeagueMemberPosition,
} from '../../constants';

const styles = theme => ({
  leagueHeader: {
    position: 'absolute',
    bottom: '28%',
    right: '10%',
  },
  leagueName: {
    fontSize: 42,
    [theme.breakpoints.up('xl')]: {
      fontSize: 49,
    },
  },
  positionInfo: {
    fontSize: 24,
    [theme.breakpoints.up('xl')]: {
      fontSize: 32,
    },
  },
  text: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 900,
    color: 'rgb(255, 255, 255)',
  },
  ordinalIndicator: {
    display: 'inline-block',
    verticalAlign: 'super',
  },
  leaguePointsUnit: {},
  leaguePointsValue: {},
  placeHeader: {},
  ...LEAGUE_MEMBER_POSITION_STYLE,
});

const LeagueComponent = ({
  classes, leagueData, leagueConfig,
}) => {
  if (!leagueData || !leagueData.members.length) return null;
  const topMemberValue = leagueData.members[0].league_points;
  const membersCount = leagueData.members.length;
  const bottomMemberValue = leagueData.members[membersCount - 1].league_points;
  const variation = Math.abs(topMemberValue - bottomMemberValue);
  return (
    <React.Fragment>
      {leagueData.members.map((member, index) => {
        const memberName = getNameOfLeagueMember(member, leagueData);
        const position = getLeagueMemberPosition(
          index, member.league_points, topMemberValue, variation, membersCount,
        );
        if (!position) return null;
        const config = leagueConfig[position];
        const isSpecific = member.location_uid === leagueData.own_location_uid;
        return (
          <LeagueMemberComponent
            key={member.location_uid}
            classes={{
              root: classes[config.className],
              value: classes.leaguePointsValue,
              unit: classes.leaguePointsUnit,
              placeHeader: classes.placeHeader,
            }}
            avatar={config.avatar}
            placeHeader={memberName}
            value={member.league_points}
            unit={LEAGUE_TABLE_POINTS_UNIT_LABEL[leagueData.points_unit]}
            rank={member.rank}
            isSpecific={isSpecific}
          />
        );
      })}
      <Grid className={classes.leagueHeader}>
        <Typography align="center" className={classNames(classes.leagueName, classes.text)}>
          League
        </Typography>
        <Typography className={classNames(classes.positionInfo, classes.text)}>
          Our School is {leagueData.own_rank}<span className={classes.ordinalIndicator}>{getOrdinal(leagueData.own_rank).ordinalIndicator}</span> of {leagueData.total_members}
        </Typography>
      </Grid>
    </React.Fragment>
  );
};

LeagueComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  leagueData: PropTypes.object,
  leagueConfig: PropTypes.object,
};

LeagueComponent.defaultProps = {
  leagueData: null,
  leagueConfig: LEAGUE_MEMBER_POSITION_CONFIG,
};

export default withStyles(styles)(LeagueComponent);
