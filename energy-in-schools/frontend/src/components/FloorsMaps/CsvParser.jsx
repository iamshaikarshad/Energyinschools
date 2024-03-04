import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Button, Grid } from '@material-ui/core';

class CsvParser extends Component {
  onDrop = (acceptedFiles) => {
    // eslint-disable-next-line react/prop-types
    const { csvParserSubmit } = this.props;
    const types = acceptedFiles.map(acceptedFile => acceptedFile.type);
    if (types.every(e => e === 'text/csv')) {
      csvParserSubmit(acceptedFiles);
    }
  };

  clearEventFiles = (event) => {
    // eslint-disable-next-line no-param-reassign
    event.target.type = 'text';
    // eslint-disable-next-line no-param-reassign
    event.target.type = 'file';
  }

  uploadCsvFiles = (event) => {
    // eslint-disable-next-line react/prop-types
    const { csvParserSubmit } = this.props;
    const uploadedFiles = event.target.files;
    const uploadedArray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < uploadedFiles.length; i++) {
      uploadedArray.push(uploadedFiles[i]);
    }
    csvParserSubmit(uploadedArray);
    this.clearEventFiles(event);
  }


  render() {
    // eslint-disable-next-line react/prop-types
    const { children } = this.props;
    return (
      <React.Fragment>
        <Dropzone onDrop={this.onDrop} multiple>
          {({ getRootProps, isDragAccept }) => {
            let placeholder = (
              <label htmlFor="raised-button-file">
                <Button
                  component="span"
                  style={{ color: 'white', textTransform: 'none', margin: '10px 0' }}
                >
                  Drag CSV Files or click here to upload sensors
                </Button>
                <input
                  accept="text/csv"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  multiple
                  type="file"
                  onChange={this.uploadCsvFiles}
                />
              </label>
            );
            if (isDragAccept) {
              placeholder = <h3>Drop files now</h3>;
            }
            return (
              <div
                {...getRootProps()}
                style={{
                  color: 'rgba(255, 255, 255, 0.87)',
                  backgroundColor: isDragAccept ? 'rgba(77, 175, 124, .7)' : 'rgba(0,0,0,.2)',
                  borderStyle: isDragAccept && 'dotted',
                  borderColor: isDragAccept && 'green',
                  width: '100%',
                }}
              >
                <Grid
                  container
                  justify="center"
                >
                  {placeholder}
                </Grid>

                {children}
              </div>
            );
          }}
        </Dropzone>
      </React.Fragment>
    );
  }
}

export default CsvParser;
