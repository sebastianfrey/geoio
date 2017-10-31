import React from 'react';

import L from 'leaflet';
import { Map, TileLayer, GeoJSON, FeatureGroup, CircleMarker, Polyline, Polygon } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"

import '../node_modules/leaflet/dist/leaflet.css';
import '../node_modules/leaflet-draw/dist/leaflet.draw.css';

import colorUtil from './colorUtil';
import { fromGeoJSON } from './geometryUtil';
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
      extent: extent,
      editableLayer: -1,
    }
    this.layerStore.subscribe(this.layerStoreListener.bind(this));
  }

  componentDidUpdate() {
    const { map } = this.refs;
    const { layers } = this.state;
    const leafletLayers = map.leafletElement._layers;

    let layerIds = layers.map(layer => layer.id);

    map.leafletElement.invalidateSize();    

    Object.values(leafletLayers)
      .filter(layer => layer.options.layerId != null)
      .sort((a, b) => layerIds.indexOf(a.options.layerId) < layerIds.indexOf(b.options.layerId) ? 1 : -1)
      .forEach(layer => { layer.bringToFront();});
  }

  layerStoreListener() {
    const { layers, extent, editableLayer } = this.layerStore.getState();
    this.setState({ layers, extent, editableLayer });
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
    let { layers, extent, editableLayer } = this.state;

    layers = layers.map(layer => Object.assign({}, layer));
    
    let editLayer = layers.find(layer => layer.id === editableLayer);

    let editControlOptions = {};

    if (editLayer) {
      let drawOptions = {
        polyline: false,
        polygon: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      };

      switch (editLayer.geometryType) {
        case "Point": {
          drawOptions.circlemarker = true;
          break;
        }

        case "MultiLineString": {
          drawOptions.polyline = true;
          break;
        }

        case "Polygon": {
          drawOptions.polygon = true;
          break;
        }

        default: break;
      }

      let editOptions = {
        edit: editLayer.geometryType === "Point"
      };

      editControlOptions = Object.assign(editControlOptions, {
        position: 'topright',
        draw: drawOptions,
        edit: editOptions
      });
    }

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
              let style = { fillColor: layer.color, color: layer.color, layerId: layer.id};

              if (editLayer === layer) {
                return (
                  <FeatureGroup
                    key={layer.id}
                    options={{priority: i }}>
                    <EditControl
                      position='topright'
                      onEdited={this._onEditPath}
                      onCreated={this._onCreate}
                      onDeleted={this._onDeleted}
                      {...editControlOptions}
                    />
                    {
                      layer.data
                        .map((feature, j) => {
                          let { geometry } = feature;
                          let options = Object.assign({
                            key: j
                          }, fromGeoJSON(geometry), style);


                          switch (geometry.type) {
                            case "Point": {
                              return <CircleMarker {...options}/>;
                            }

                            case "MultiLineString": {
                              return <Polyline {...options} />;
                            }

                            case "Polygon": {
                              return <Polygon {...options} />;
                            }

                            default:
                              return null;
                          }

                        })
                        .filter(geometry => geometry != null)
                    }
                  </FeatureGroup>
                )
              }
              else {
                return (
                  layer.geometryType === "Point" ?
                    <GeoJSON
                      key={layer.id}
                      pointToLayer={(feature, latlng) => {
                        return L.circleMarker(latlng, style);
                      }}
                      options={{ layerId: layer.id }}
                      data={layer.data} />
                    :
                    <GeoJSON
                      key={layer.id}
                      style={() => {
                        return style;
                      }}
                      options={{ playerId: layer.id }}
                      data={layer.data} />
                );
              }
            })
        }
      </Map>
    );
  }
}