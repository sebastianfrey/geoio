import React from 'react';
import DropZone from 'react-dropzone';

import L from 'leaflet';
import { Map, Marker, Popup, TileLayer, GeoJSON, CircleMarker } from 'react-leaflet';

import GeoJsonCluster from './leaflet/GeoJSONCLuster.js';

import ShapeServiceWorker from './workers/ShapeService.worker.js';

const position = [27.4928779, 89.3581967];
const accept = '.shp';

var layerIdx = 0;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default class MapController extends React.Component {
  constructor() {
    super()
    this.state = {
      accept: accept,
      files: [],
      dropzoneActive: false,
      layers: []
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
        worker.onmessage = this.handleMessage.bind(this, worker, file);
        worker.postMessage(reader.result);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  handleMessage(worker, file, result) {
    worker.terminate();
    let parts = file.name.split(".");
    parts.pop();
    result.layer = parts.join(",");
    this.addGeoJSONLayer(result.data);
  }

  addGeoJSONLayer(data) {
    const { layers } = this.state;
    let layer = {
      id: layerIdx++,
      type: "GeoJSONLayer",
      name: data.layer,
      data: data.features,
      extent: { xmin: data.xmin, ymin: data.ymin, xmax: data.xmax, ymax: data.ymax },
      color: getRandomColor()
    }

    if (layers.some((lyr) => lyr.name === layer.name)) return;

    layers.push(layer);

    this.setState({
      layers: layers
    });
  }


  render() {
    const { accept, layers, dropzoneActive } = this.state;
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
            {
              layers.map(layer => {

                return (
                  <GeoJSON
                    key={layer.id}
                    pointToLayer={(feature, latlng) => {
                      return L.circleMarker(latlng, { fillColor: layer.color, color: layer.color });
                    }}
                    data={layer.data} />
                );
              })
            }
          </Map>
      </DropZone>
    );
  }
}