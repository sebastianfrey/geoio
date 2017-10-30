import React from 'react';

import L from 'leaflet';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';

import colorUtil from './colorUtil';

import { addLayer  } from './map/actions';

const accept = '.shp';

export default class MapController extends React.Component {
  constructor(props) {
    super(props)
    this.layerStore = this.props.layerStore;
    const { extent } = this.layerStore.getState();
    this.state = {
      accept: accept,
      files: [],
      dropzoneActive: false,
      layers: [],
      extent: extent
    }
    this.layerStore.subscribe(this.layerStoreListener.bind(this));
  }

  componentDidUpdate() {
    const { map } = this.refs;
    const layers = map.leafletElement._layers;

    Object.values(layers)
      .filter(layer => layer.options.zIndex)
      .sort((a, b) => a.options.zIndex - b.options.zIndex);
  }

  layerStoreListener() {
    const { layers, extent } = this.layerStore.getState();
    this.setState({ layers, extent });
  }


  handleDrop(worker, file, result) {
    worker.terminate();
    let parts = file.name.split(".");
    parts.pop();
    result.data.layer = parts.join(".");
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
        color: colorUtil.random()
      })
    );

    const { layers } = this.layerStore.getState();
    this.setState({ layers });
  }


  render() {
    let { layers, extent } = this.state;

    layers = layers.map(layer => Object.assign({}, layer));
    
    return (
      <Map className="map-controller" bounds={extent} ref="map">
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {
          layers
            .reverse()
            .filter(layer => layer.visible)
            .map((layer, i) => {

              return (
                layer.geometryType === "Point" ?
                  <GeoJSON
                    key={layer.id}
                    pointToLayer={(feature, latlng) => {
                      return L.circleMarker(latlng, { fillColor: layer.color, color: layer.color, zIndex: i });
                    }}
                    options={{zIndex: i }}
                    data={layer.data} />
                  :
                  <GeoJSON
                    key={layer.id}
                    style={() => {
                      return {
                        color: layer.color
                      };
                    }}
                    options={{zIndex: i }}
                    data={layer.data} />
              );
            })
        }
      </Map>
    );
  }
}