import DropZone from 'react-dropzone';
import React from 'react';

import * as Promise from 'bluebird';

import { readFile } from "./promise/util";

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
      let { handleDrop, handleDropError } = ref;
      
      if (typeof handleDrop === "function") {
        let files = acceptedFiles
          .reduce((res, file) => {
            
            let parts = file.name.split(".");
            let extension = parts.pop();
            let name = parts.join(".");
            
            if (!res[name]) {
              res[name] = {};
            }

            res[name][extension] = file;

            return res;
          }, {});

        Object.keys(files)
          .map(name => {
            let file = files[name];

            return {
              name,
              parts : Object.keys(file).reduce((res, ext) => {
                let opts = {};

                switch (ext) {
                  
                  case "dbf":
                  case "shp":
                  case "shx": {
                    opts.readAs = "ArrayBuffer";
                    break;
                  }

                  case "cpg":
                  case "prj":
                  default: {
                    opts.readAs = "Text";
                    break;
                  }
                }

                return Object.assign(res, { [ext] : readFile(file[ext], opts) });
              }, {})
            }
          })
          .forEach(file => {
            Promise.props(file.parts)
              .then((results) => {
                let worker = new ShapeServiceWorker();

                worker.onmessage = (result) => {
                  worker.terminate();
                  handleDrop.apply(ref, [ result, file ])
                };
                
                worker.onerror = (e) => {
                  worker.terminate();
                  if (typeof handleDropError === 'function') {
                    handleDropError.apply(ref, [ e ]);                    
                  }
                };
                
                worker.postMessage(results);
              });
          });

/*         for (let file in files) {
          var reader = new FileReader();
            reader.onload = () => {
              let worker = new ShapeServiceWorker();
              worker.onmessage = handleDrop.bind(ref, worker, file);
              worker.postMessage(reader.result);
            };  
            reader.readAsArrayBuffer(file);
        } */
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