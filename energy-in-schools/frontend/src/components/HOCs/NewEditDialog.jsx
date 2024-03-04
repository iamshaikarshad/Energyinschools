import React from 'react';

export const DIALOG_ACTIONS = Object.freeze({
  new: 'new',
  edit: 'edit',
});

export const withNewEditDialog = config => (WrappedComponent) => {
  class WithNewEditDialog extends React.Component {
      state = {
        dialog: {
          opened: false,
          action: '',
          title: '',
          dialogData: {},
        },
      };

      toggleDialogHandler = (action, dialogData = {}) => {
        const commonState = {
          opened: true,
          action,
          dialogData: {},
        };
        switch (action) {
          case DIALOG_ACTIONS.new:
            this.setState({
              dialog: {
                ...commonState,
                title: config[action].title,
                dialogData,
              },
            });
            break;
          case DIALOG_ACTIONS.edit:
            this.setState({
              dialog: {
                ...commonState,
                title: config[action].title,
                dialogData,
              },
            });
            break;
          default:
            this.setState({
              dialog: {
                opened: false,
                action: '',
                title: '',
                dialogData: {},
              },
            });
        }
      };

      render() {
        const { dialog } = this.state;
        return <WrappedComponent dialog={dialog} toggleDialogHandler={this.toggleDialogHandler} {...this.props} />;
      }
  }

  return WithNewEditDialog;
};
