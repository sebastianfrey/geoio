import React from 'react';
import DropZone from 'react-dropzone';

import L from 'leaflet';
import { Map, Marker, Popup, TileLayer, GeoJSON, CircleMarker } from 'react-leaflet';

import ShapeServiceWorker from './workers/ShapeService.worker.js';

import { ADD_LAYER, REMOVE_LAYER, addLayer, removeLayer  } from './map/actions';

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
  constructor(props) {
    super(props)
    this.state = {
      accept: accept,
      files: [],
      dropzoneActive: false,
      layers: []
    }
    this.layerStore = this.props.layerStore;
    this.layerStore.subscribe(this.layerStoreListener.bind(this));
    
  }

  layerStoreListener() {
    const { layers } = this.layerStore.getState();
    this.setState({ layers });
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
    result.data.layer = parts.join(",");
    this.addGeoJSONLayer(result.data);
  }

  addGeoJSONLayer(featureSet) {
    this.layerStore.dispatch(
      addLayer({
        type: "GeoJSONLayer",
        name: featureSet.layer,
        data: featureSet.features,
        geometryType: featureSet.geometryType,
        visible: true,
        extent: featureSet.extent,
        color: getRandomColor()
      })
    );

    const { layers } = this.layerStore.getState();
    this.setState({ layers });
  }


  render() {
    const { accept, dropzoneActive, layers } = this.state;
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
              layers
                .filter(layer => layer.visible)
                .map(layer => {

                  return (
                    layer.geometryType === "Point" ?
                      <GeoJSON
                        key={layer.id}
                        pointToLayer={(feature, latlng) => {
                          return L.circleMarker(latlng, { fillColor: layer.color, color: layer.color });
                        }}
                        data={layer.data} />
                      :
                      <GeoJSON
                        key={layer.id}
                        style={() => {
                          return {
                            color: layer.color,
                          };
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