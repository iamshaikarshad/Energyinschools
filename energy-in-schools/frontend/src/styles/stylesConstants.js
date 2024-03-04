const DASHBOARD_FONTS = Object.freeze({
  primary: 'NoteWorthy',
  secondary: 'Roboto',
});

const mlScreenWidthLimit = Object.freeze({
  lower: 1280,
  upper: 1600,
});

export const mlSreenSizeMediaQuery = Object.freeze({
  only: `@media screen and (min-width: ${mlScreenWidthLimit.lower}px) and (max-width: ${mlScreenWidthLimit.upper - 1}px)`,
  up: `@media screen and (min-width: ${mlScreenWidthLimit.upper}px)`,
  down: `@media screen and (max-width: ${mlScreenWidthLimit.upper - 1}px)`,
});

export const menuConfig = {
  keepMounted: true,
  elevation: 0,
  getContentAnchorEl: null,
  anchorOrigin: { vertical: 'top', horizontal: 'center' },
  transformOrigin: { vertical: 'top', horizontal: 'center' },
  PaperProps: {
    style: {
      maxHeight: 130,
    },
  },
};

export const NEW_PRIMARY_COLOR = '#0077C8';
export const NEW_GRAY_BACKGROUND = '#f2efed';

export { DASHBOARD_FONTS as default };
