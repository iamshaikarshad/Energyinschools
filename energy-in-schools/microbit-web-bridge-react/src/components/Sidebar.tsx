import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

const styles = theme => ({
  btn: {
    position: 'fixed' as 'fixed',
    zIndex: 100,
    width: 320,
    top: 80,
    left: 0,
    backgroundColor: '#0177c9',
    color: '#fff',
    transition: 'all 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;',
    '&:hover': {
      backgroundColor: '#0177c9'
    }
  },
  right: {
    right: '-176px',
    paddingLeft: 25,
    justifyContent: 'flex-start',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    left: 'unset',

    '&.open': {
      borderBottomLeftRadius: 0,
      right: 0
    },

    [theme.breakpoints.down('xs')]: {
      right: 0,
      width: 144
    }
  },
  left: {
    left: '-176px',
    paddingRight: 25,
    justifyContent: 'flex-end',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    right: 'unset',
    '&.open': {
      borderBottomRightRadius: 0,
      left: 0
    },

    [theme.breakpoints.down('xs')]: {
      left: 0,
      width: 144
    }
  },
  sidebar: {
    position: 'static !important' as 'static',
    '& .MuiBackdrop-root': {
      backgroundColor: 'transparent'
    },
    '& .MuiPaper-root': {
      width: 319.5,
      height: 520,
      zIndex: 99,
      boxSizing: 'border-box' as 'border-box',
      padding: '60px 20px 15px',
      top: 80,
      [theme.breakpoints.down('xs')]: {
        width: 144
      }
    }
  }
});

const Sidebar = ({ direction, classes, label, messages }) => {
  const [isOpen, toggleSidebar] = React.useState(false);
  const sidebar = React.useRef<HTMLDivElement>(null);

  function toggleDrawer(open: boolean) {
    return () => {
      toggleSidebar(open);
    };
  }

  return (
    <>
      <Button
        className={`${classes.btn} ${
          direction === 'right' ? classes.right : classes.left
        } ${isOpen ? 'open' : 'close'}`}
        onClick={toggleDrawer(!isOpen)}
      >
        {direction === 'right' && isOpen ? <ChevronRight /> : <ChevronLeft />}
        {label}
        {direction === 'left' && isOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      <Drawer
        ref={sidebar}
        className={classes.sidebar}
        anchor={direction}
        open={isOpen}
      >
        {messages.map((message, index) => {
          const key = `${index}`;

          return (
            <span key={key}>
              {messages[messages.length - 1 - index]}
              <br />
            </span>
          );
        })}
      </Drawer>
    </>
  );
};

export default withStyles(styles)(Sidebar);
