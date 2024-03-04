import { LEAGUE_MEMBER_POSITION_CLASSNAME, LEAGUE_MEMBER_POSITION } from '../../constants';

import leaguePenguinBottomImg from '../../../../images/Dashboard_V2_Arts/flippers_bottom.svg';
import leaguePenguinMiddleImg from '../../../../images/Dashboard_V2_Arts/flippers_middle.svg';
import leaguePenguinTopImg from '../../../../images/Dashboard_V2_Arts/flippers_top.svg';

export const ELECTRICITY_LEAGUE_MEMBER_POSITION_CONFIG = Object.freeze({ // eslint-disable-line import/prefer-default-export
  [LEAGUE_MEMBER_POSITION.top]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.topMember,
    avatar: leaguePenguinTopImg,
  },
  [LEAGUE_MEMBER_POSITION.middleTop]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.middleTopMember,
    avatar: leaguePenguinMiddleImg,
  },
  [LEAGUE_MEMBER_POSITION.middle]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.middleMember,
    avatar: leaguePenguinMiddleImg,
  },
  [LEAGUE_MEMBER_POSITION.middleBottom]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.middleBottomMember,
    avatar: leaguePenguinMiddleImg,
  },
  [LEAGUE_MEMBER_POSITION.bottom]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.bottomMember,
    avatar: leaguePenguinBottomImg,
  },
});
