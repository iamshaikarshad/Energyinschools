import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const styles = {
  root: {
    width: '100%',
    fontSize: 'inherit',
  },
  textContainer: {
    width: '100%',
    overflow: 'auto',
    fontSize: 'inherit',
    fontWeight: 'inherit',
  },
  buttonWrapper: {
    width: '100%',
    textAlign: 'center',
    fontSize: 'inherit',
    fontWeight: 'inherit',
  },
  button: {
    textTransform: 'none',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    padding: '4px 6px',
    color: 'rgb(0, 188, 212)',
  },
  showMoreButton: {},
  showLessButton: {},
};

const TruncateTextByItemsCountLimit = ({
  classes, itemsCountToShow, items, showMoreButtonLabel, showLessButtonLabel, rootElemProps, itemsToTextTransformer, onUpdated,
}) => {
  const [expanded, toggleExpand] = useState(false);

  const { length: totalCount } = items;

  const itemsToShow = items.filter((item, index) => index < itemsCountToShow || expanded);

  const textToShow = itemsToTextTransformer(itemsToShow);

  useEffect(() => {
    onUpdated();
  }, [expanded]);

  return (
    <Typography component="div" className={classes.root} {...rootElemProps}>
      <Typography className={classes.textContainer}>{textToShow}</Typography>
      {itemsCountToShow < totalCount && (
        <Typography component="div" className={classes.buttonWrapper}>
          <Button
            className={classNames(
              classes.button,
              {
                [classes.showMoreButton]: !expanded,
                [classes.showLessButton]: expanded,
              },
            )}
            onClick={() => { toggleExpand(!expanded); }}
          >
            {expanded ? showLessButtonLabel : showMoreButtonLabel}
          </Button>
        </Typography>
      )}
    </Typography>
  );
};

TruncateTextByItemsCountLimit.propTypes = {
  classes: PropTypes.object.isRequired,
  items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  itemsCountToShow: PropTypes.number,
  showMoreButtonLabel: PropTypes.string,
  showLessButtonLabel: PropTypes.string,
  rootElemProps: PropTypes.object,
  itemsToTextTransformer: PropTypes.func,
  onUpdated: PropTypes.func,
};

TruncateTextByItemsCountLimit.defaultProps = {
  items: [],
  itemsCountToShow: 10,
  showMoreButtonLabel: '...show more',
  showLessButtonLabel: '...show less',
  rootElemProps: {},
  itemsToTextTransformer: items => items.join(', '),
  onUpdated: () => {},
};

export default withStyles(styles)(TruncateTextByItemsCountLimit);
