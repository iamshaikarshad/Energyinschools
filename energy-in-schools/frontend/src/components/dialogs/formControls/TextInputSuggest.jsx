import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator } from 'react-material-ui-form-validator';

import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import RootRef from '@material-ui/core/RootRef';
import InputAdornment from '@material-ui/core/InputAdornment';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { withStyles } from '@material-ui/core/styles/index';

const styles = {
  suggestionsDropdown: {
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 4,
    boxShadow: '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
  },
};

class TextInputSuggest extends React.Component {
  state = {
    suggestionBlockIsOpened: false,
    value: '',
  };

  rootRef = React.createRef();

  inputRef = React.createRef();

  setSuggestionValue = (value) => {
    const { onChange } = this.props;
    this.setState({ value }, () => {
      onChange(value);
      this.closeSuggestionBlock();
    });
  };

  handleClickOutside = (e) => {
    if (!this.rootRef.current.contains(e.target)) {
      this.closeSuggestionBlock();
    }
  };

  closeSuggestionBlock = () => {
    this.setState({ suggestionBlockIsOpened: false });
  };

  toggleSuggestionBlock = () => {
    this.setState(prevState => ({ suggestionBlockIsOpened: !prevState.suggestionBlockIsOpened }));
  };

  render() {
    const {
      classes,
      textInputProps,
      showHint,
      hintText,
      hintStyle,
      suggestions,
      suggestionBlockStyle,
      suggestionPlacement,
    } = this.props;
    const {
      suggestionBlockIsOpened,
      value,
    } = this.state;

    return (
      <RootRef rootRef={this.rootRef}>
        <React.Fragment>
          <div ref={this.inputRef}>
            <TextValidator
              className={classes.textInput}
              onChange={event => this.setSuggestionValue(event.target.value)}
              onClick={() => this.toggleSuggestionBlock()}
              value={value}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ExpandMore style={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              {...textInputProps}
            />
          </div>
          {showHint && (
            <div style={hintStyle}>{hintText}</div>
          )}
          <Popper
            anchorEl={this.inputRef.current}
            open={suggestionBlockIsOpened}
            placement={suggestionPlacement}
            transition
            style={{ zIndex: 10000 }} // important for visibility in modals
          >
            {({ TransitionProps }) => (
              <ClickAwayListener onClickAway={this.handleClickOutside}>
                <Grow
                  {...TransitionProps}
                  className={classes.suggestionsDropdown}
                  style={suggestionBlockStyle}
                >
                  <MenuList>
                    {suggestions.map(suggestion => (
                      <MenuItem
                        key={suggestion.value}
                        value={suggestion.value}
                        onClick={() => this.setSuggestionValue(suggestion.value)}
                      >
                        {suggestion.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Grow>
              </ClickAwayListener>
            )}
          </Popper>
        </React.Fragment>
      </RootRef>
    );
  }
}

TextInputSuggest.propTypes = {
  classes: PropTypes.object.isRequired,
  textInputProps: PropTypes.object,
  suggestions: PropTypes.array.isRequired,
  suggestionPlacement: PropTypes.string,
  showHint: PropTypes.bool,
  hintText: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  suggestionBlockStyle: PropTypes.object,
  hintStyle: PropTypes.object,
};

TextInputSuggest.defaultProps = {
  textInputProps: {},
  showHint: false,
  hintText: '',
  suggestionPlacement: 'bottom-start',
  suggestionBlockStyle: {},
  hintStyle: {},
};

export default compose(withStyles(styles))(TextInputSuggest);
