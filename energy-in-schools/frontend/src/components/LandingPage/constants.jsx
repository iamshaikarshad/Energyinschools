import { NEW_GRAY_BACKGROUND, NEW_PRIMARY_COLOR } from '../../styles/stylesConstants';

export const LANDING_PAGE_COMMON_STYLES = theme => ({
  title: {
    width: '100%',
    margin: '40px 0 0 0',
    color: NEW_PRIMARY_COLOR,
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 36,
    [theme.breakpoints.down('xs')]: {
      fontSize: 30,
    },
  },
  message: {
    fontFamily: 'Inter',
    fontWeight: 'normal',
    fontSize: 16,
    margin: '40px 0 0 0',
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  messageBlockList: {
    margin: 0,
    paddingLeft: 20,
    listStyleType: 'none',
  },
  messageBlockItem: {
    position: 'relative',
    margin: '15px 0',
    '&::before': {
      position: 'absolute',
      display: 'block',
      content: '""',
      border: `2px solid ${NEW_PRIMARY_COLOR}`,
      borderRadius: 5,
      height: 10,
      width: 10,
      left: -20,
      top: 5,
    },
  },
  mainTitle: {
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 36,
    color: 'white',
    '@media (max-width: 1150px)': {
      fontSize: 30,
    },
    '@media (max-width: 786px)': {
      textAlign: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 25,
    },
  },
  button: {
    width: 160,
    height: 32,
    padding: '5px 10px 2px 10px',
    margin: '5px 10px 5px 0',
    borderRadius: 16,
    textTransform: 'none',
    fontFamily: 'SamsungSharpSans',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 'normal',
    boxShadow: 'none',
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: '#b5dffd',
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 5,
    },
    '@media (max-width: 786px)': {
      width: '100%',
      marginRight: 0,
      paddingRight: 0,
    },
  },
  benefitsImageBlock: {
    backgroundColor: NEW_PRIMARY_COLOR,
    minHeight: 600,
    [theme.breakpoints.down('xs')]: {
      minHeight: 300,
    },
  },
  benefitsImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  benefitsBlock: {
    padding: '20px 50px',
  },
  greyBackground: {
    backgroundColor: NEW_GRAY_BACKGROUND,
  },
  whiteBackground: {
    backgroundColor: '#fff',
  },
});

export const LANDING_PAGE_MENU_HEIGHT = 64;

export const WINDOW_SCROLL_DELAY = 150; // in milliseconds
export const MIN_SCROLL_PIXELS_COUNT_TO_SHOW_SCROLL_BUTTON = 200;
