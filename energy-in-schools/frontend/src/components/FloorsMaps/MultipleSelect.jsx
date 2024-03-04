import * as React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import {
  MenuItem,
  FormControl,
  Select,
  ListItemIcon,
  Checkbox,
  ListItemText,
  Button,
} from '@material-ui/core';

import { SELECTED_BUTTON_COLOR, FLOORS_MAPS_TEXT_COLOR } from './constants';

const styles = {
  select: {
    minWidth: 250,
  },
  labelWrapper: {
    paddingLeft: 16,
  },
  listItem: {
    widht: 250,
    maxHeight: 48 * 4.5 + 8,
  },
  manageButton: {
    height: 36,
    padding: '4px 8px 2px',
    margin: 8,
    borderRadius: 10,
    backgroundColor: SELECTED_BUTTON_COLOR,
    color: FLOORS_MAPS_TEXT_COLOR,
    fontSize: 12,
    lineHeight: 'normal',
    '&:hover': {
      backgroundColor: SELECTED_BUTTON_COLOR,
    },
  },
};

class MultipleSelect extends React.PureComponent {
  handleChange = (event) => {
    const { setSelectedToState } = this.props;
    const selectedItem = event.target.value;
    setSelectedToState(selectedItem);
  };

  render() {
    const {
      open,
      classes,
      handleClose,
      handleOpen,
      selectedItems,
      items,
      title,
      reverse,
      maxSelectedItemsCount,
    } = this.props;

    return (
      <div>
        <FormControl sx={{ m: 1, width: 300 }} required>
          {(selectedItems.length > 0 || reverse) && (
            <Button
              id="openSelector"
              variant="contained"
              onClick={handleOpen}
              className={classes.manageButton}
            >
                {title}
            </Button>
          )}
          <Select
            id="demo-multiple-sensor"
            multiple
            open={open}
            value={selectedItems}
            onChange={this.handleChange}
            onOpen={handleOpen}
            onClose={handleClose}
            renderValue={selected => selected.join(', ')}
            style={{ display: 'none' }}
            MenuProps={{
              anchorEl: document.getElementById('openSelector'),
              PaperProps: {
                style: {
                  maxHeight: 48 * 4.5 + 8,
                  width: 250,
                },
              },
            }}
            className={classes.select}
          >
            {items.map(type => (
              <MenuItem
                disabled={selectedItems.length === maxSelectedItemsCount && !selectedItems.includes(type)}
                key={type}
                value={type}
              >
                <ListItemIcon>
                  <Checkbox checked={reverse ? !selectedItems.includes(type) : selectedItems.includes(type)} />
                </ListItemIcon>
                <ListItemText primary={type} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }
}

MultipleSelect.propTypes = {
  open: PropTypes.bool.isRequired,
  handleOpen: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedItems: PropTypes.array,
  items: PropTypes.array,
  setSelectedToState: PropTypes.func,
  classes: PropTypes.object.isRequired,
  reverse: PropTypes.bool,
  title: PropTypes.string,
  maxSelectedItemsCount: PropTypes.number,
};

MultipleSelect.defaultProps = {
  selectedItems: [],
  items: [],
  setSelectedToState: () => {},
  reverse: false,
  title: '',
  maxSelectedItemsCount: 0,
};

export default withStyles(styles)(MultipleSelect);
