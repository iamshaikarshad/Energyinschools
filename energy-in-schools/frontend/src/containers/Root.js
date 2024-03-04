import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';
import App from './App';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#62efff',
      main: '#00bcd4',
      dark: '#008ba3',
      contrastText: '#f9f9f9',
    },
    secondary: {
      light: '#ff77a9',
      main: '#ec407a',
      dark: '#b4004e',
      contrastText: '#000',
    },
  },
  breakpoints: {
    keys: ['xs', 'sm', 'md', 'lg', 'xl'],
    values: Object.freeze({
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    }),
  },
});

export default function Root(props) {
  const { store, history } = props;
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Fragment>
          <CssBaseline />
          <MuiThemeProvider theme={theme}>
            <App />
          </MuiThemeProvider>
        </Fragment>
      </ConnectedRouter>
    </Provider>
  );
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};
