import ListIcon from '@material-ui/icons/List';

export const CATEGORY_ALL = 'ALL';

export const DEFAULT_SELECTED_CATEGORIES = [
  'Overview of the platform and features',
];

export const TAB = Object.freeze({
  preview: {
    icon: null,
    label: 'overview',
    value: 'preview',
  },
  categories: {
    icon: ListIcon,
    label: 'categories',
    value: 'categories',
  },
});

export const WINDOW_SCROLL_DELAY = 150;

export const MIN_WINDOW_SCROLL_PIXELS = 200;

export const getNonEmptyCategories = categoriesData => categoriesData.filter(category => category.manuals.length > 0);
