import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DragAndDrop extends Component {
  state = {
    dragging: false,
  }

  dragCounter = 0;

  dropRef = React.createRef();


  componentDidMount() {
    const div = this.dropRef.current;
    div.addEventListener('dragenter', this.handleDragIn);
    div.addEventListener('dragleave', this.handleDragOut);
    div.addEventListener('dragover', this.handleDrag);
    div.addEventListener('drop', this.handleDrop);
  }

  componentWillUnmount() {
    const div = this.dropRef.current;
    div.removeEventListener('dragenter', this.handleDragIn);
    div.removeEventListener('dragleave', this.handleDragOut);
    div.removeEventListener('dragover', this.handleDrag);
    div.removeEventListener('drop', this.handleDrop);
  }

  handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter++; // eslint-disable-line no-plusplus
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ dragging: true });
    }
  }

  handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter--; // eslint-disable-line no-plusplus
    if (this.dragCounter === 0) {
      this.setState({ dragging: false });
    }
  }

  handleDrop = (e) => {
    const { handleDrop } = this.props;
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragging: false });
    if (e.dataTransfer.files.length) {
      handleDrop(e.dataTransfer.files);
      e.dataTransfer.clearData();
      this.dragCounter = 0;
    }
  }


  render() {
    const { dragging } = this.state;
    const { children, style } = this.props;

    return (
      <div
        // style={{ display: 'inline-block', position: 'relative' }}
        style={style}
        ref={this.dropRef}
      >
        {dragging && (
          <div
            style={{
              border: 'dashed grey 4px',
              backgroundColor: 'rgba(255,255,255,.8)',
              position: 'relative',
              width: '100vw',
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: 0,
                left: 0,
                textAlign: 'center',
                color: 'grey',
                fontSize: 36,
              }}
            >
              <div>Drop floor plan here</div>
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }
}

DragAndDrop.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  handleDrop: PropTypes.func,
  style: PropTypes.object,
};

DragAndDrop.defaultProps = {
  handleDrop: () => {},
  style: {},
};

export default DragAndDrop;
