import moment from 'moment';

export const FEEDBACK_COLORS = {
  highlight: 'rgb(0, 188, 212)',
  grey: 'rgb(181, 181, 181)',
  white: 'rgb(255, 255, 255)',
  text: 'rgb(74, 74, 74)',
};

export const MAX_TEXT_LENGTH = 450;

export const COMMENT_CREATED_TIME_FORMAT = 'DD/MM/YY HH:mm';

export const MAX_TAGS_COUNT_TO_SHOW = {
  xs: 1,
  sm: 2,
  md: 2,
  lg: 3,
  xl: 4,
};

export const FEEDBACK_TAGS = [
  {
    name: 'schools_portal',
    label: 'Schools portal',
  },
  {
    name: 'problem',
    label: 'Problem',
  },
  {
    name: 'new_functionality',
    label: 'New functionality',
  },
  {
    name: 'how_to',
    label: 'How to',
  },
  {
    name: 'dashboard',
    label: 'Dashboard',
  },
  {
    name: 'bug',
    label: 'Bug',
  },
  {
    name: 'proposal',
    label: 'Proposal',
  },
  {
    name: 'other',
    label: 'Other',
  },
];

export const FEEDBACK_TYPES = [
  {
    type: 'feedback',
    label: 'Feedback',
  },
  {
    type: 'question',
    label: 'Question',
  },
  {
    type: 'issue',
    label: 'Issue',
  },
];

export const FEEDBACK_DIALOG_STYLE = {
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '28px auto',
    textAlign: 'center',
  },
  textInputLabel: {
    fontSize: 16,
    color: '#555555',
  },
  textInputHelper: {
    fontSize: 12,
    color: '#b5b5b5',
    marginBottom: 10,
  },
};

export const FEEDBACK_TEXT_BOX = {
  rows: 7,
  rowsMax: 11,
};

export const FEEDBACK_ERROR_MESSAGE = {
  get: 'Something went wrong! Please reload the page.',
  post: 'Something went wrong! Try again please or reload the page.',
  delete: 'Something went wrong! Try again please or reload the page.',
  vote: 'Sorry. You have already voted for that topic!',
  vote_response: 'You have already voted',
};

export const FEEDBACK_SUCCESS_MESSAGE = {
  comment_created: 'Your comment has been published succesfully',
  comment_updated: 'Your comment has been updated succesfully',
  comment_deleted: 'Your comment has been deleted',
  topic_created: 'Your topic has been published succesfully',
  topic_updated: 'Your topic has been updated succesfully',
  topic_deleted: 'Your topic has been deleted',
};

export const FEEDBACK_MESSAGE_DELAY = 5000;

export const FEEDBACK_SORT_RULES = {
  byVotesAndOrder: (a, b) => {
    if (a.vote_total !== b.vote_total) {
      return b.vote_total - a.vote_total;
    }
    return b.id - a.id;
  },
  byCreationTime: (a, b) => (moment(a.created_at).isBefore(moment(b.created_at)) ? 1 : -1),
};
