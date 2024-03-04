import React from 'react';
import WebhubContainer from './WebhubContainer';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      '"SamsungFont"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(',')
  }
});

const App = () => {
  return (
    <>
      <MuiThemeProvider theme={theme}>
        <WebhubContainer />
      </MuiThemeProvider>
    </>
  );
};

export default App;
