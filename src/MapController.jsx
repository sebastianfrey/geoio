import React from 'react';
import DropZone from 'react-dropzone';

import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

let ShapeServiceWorker = require('worker!./workers/ShapeService.worker.js');

const position = [51.505, -0.09];
const accept = '.shp';

export default class MapController extends React.Component {
  constructor() {
    super()
    this.state = {
      accept: accept,
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
    acceptedFiles.forEach((file) => {
      var reader = new FileReader();
      reader.onload = () => {
        let worker = new ShapeServiceWorker();
        worker.onmessage = this.handleMessage.bind(this, worker);
        worker.postMessage(reader.result);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  handleMessage(worker, result) {
    worker.close();
    console.log(result);
  }


  render() {
    const { accept, files, dropzoneActive } = this.state;
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
      <DropZone className="map-controller"
        disableClick
        onDrop={this.onDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        accept={accept}>
          { dropzoneActive && <div style={overlayStyle}></div> }
          <Map className="map-node" center={position} zoom={13}>
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>
                <span>A pretty CSS3 popup.<br/>Easily customizable.</span>
              </Popup>
            </Marker>
          </Map>
      </DropZone>
    );
  }
}