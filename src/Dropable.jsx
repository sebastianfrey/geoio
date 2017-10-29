import DropZone from 'react-dropzone';
import React from 'react';

import { ACCEPT } from './settings';

import ShapeServiceWorker from './workers/ShapeService.worker.js';


export default function Dropable(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        files: [],
        dropzoneActive: false
      }
    }

    onDragEnter() {
      this.setState({
        dropzoneActive: true
      });
    }
  
    onDragLeave() {
      this.setState({
        dropzoneActive: false
      });
    }
  
    onDrop(files, rejected) {
      this.setState({
        files,
        dropzoneActive: false
      });
  
      this.handleDrop(files);
    }

    handleDrop(acceptedFiles, rejectedFiles) {
      let ref = this.refs.wrapped;
      let { handleDrop } = ref;
      
      if (typeof handleDrop === "function") {
        acceptedFiles.forEach((file) => {
          var reader = new FileReader();
          reader.onload = () => {
            let worker = new ShapeServiceWorker();
            worker.onmessage = handleDrop.bind(ref, worker, file);
            worker.postMessage(reader.result);
          };
          reader.readAsArrayBuffer(file);
        });
      } else {
        throw new Error(`WrappedComponent has no 'handleDrop' method.`);
      }
    }

    render() {
      const { dropzoneActive } = this.state;
      const overlayStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        padding: '2.5em 0',
        background: 'rgba(0,0,0,0.5)',
        textAlign: 'center',
        color: '#fff'
      };

      return (
        <DropZone className="dropzone"
          disableClick
          onDrop={this.onDrop.bind(this)}
          onDragEnter={this.onDragEnter.bind(this)}
          onDragLeave={this.onDragLeave.bind(this)}
          accept={ACCEPT}>
          { dropzoneActive && <div style={overlayStyle}></div> }
          <WrappedComponent ref="wrapped" {...this.props} />
        </DropZone>
      );
    }
  }
}