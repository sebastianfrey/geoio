import React from 'react';

import PropTypes from "prop-types";

import L from 'leaflet';
import { Map, TileLayer, GeoJSON, FeatureGroup, CircleMarker, Polyline, Polygon } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"

import '../node_modules/leaflet/dist/leaflet.css';
import '../node_modules/leaflet-draw/dist/leaflet.draw.css';

import colorUtil from './colorUtil';
import { fromGeoJSON } from './geometryUtil';
import { addLayer, addFeatures, updateFeatures, deleteFeatures  } from './core/actions';

import UUID from './services/UUID';

import Notifications from "react-notification-system-redux";

export default class MapController extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      files: [],
      dropzoneActive: false,
      layers: [],
      extent: null,
      editableLayer: -1
    }
  }

  componentWillMount() {
    const { store } = this.context;
    store.subscribe(this.storeListener.bind(this));

    const { extent } = store.getState();
    this.setState({ extent });
  }

  componentDidUpdate() {
    const { map } = this.refs;
    const { layers } = this.state;
    const leafletLayers = map.leafletElement._layers;

    let layerIds = layers.map(layer => layer.id);

    let layerColors = layers.reduce((colors, layer) => {
      colors[layer.id] = { fillColor: layer.color, color: layer.color };
      return colors;
    }, {});

    Object.values(leafletLayers)
      .filter(layer => layer.options.layerId != null)
      .sort((a, b) => layerIds.indexOf(a.options.layerId) < layerIds.indexOf(b.options.layerId) ? 1 : -1)
      .forEach(layer => {
        layer.bringToFront();
        layer.setStyle(layerColors[layer.options.layerId]);
      });
  }

  storeListener() {
    const { store } = this.context;
    const { layers, extent, editableLayer } = store.getState();
    this.setState({ layers, extent, editableLayer });
  }


  handleDrop(result, file) {
    const { store } = this.context;

    result.data.layer = file.name;
    if (result.data.features.length > 5000) {
      store.dispatch(Notifications.warning({
        title: "Warning",
        message: "FeatureSet is to big.",
        position: "br"
      }));
      return;
    }
    this.addGeoJSONLayer(result.data);
  }

  handleDropError(e) {
    const { store } = this.context;

    store.dispatch(Notifications.error({
      title: "Error",
      message: e.message,
      position: "br"
    }));
  }

  addGeoJSONLayer(featureSet) {
    const { store } = this.context;

    let { layer, features, geometryType, extent } = featureSet;

    features = features.map((feature) => {
      return Object.assign({}, feature, { uuid: UUID.generate()});
    });

    store.dispatch(
      addLayer({
        type: "GeoJSONLayer",
        name: layer,
        data: features,
        geometryType: geometryType,
        visible: true,
        extent: extent,
        color: colorUtil.random()
      })
    );

    const { layers } = store.getState();
    this.setState({ layers });
  }


  createEditControlOptions(layer) {
    let drawOptions = {
      polyline: false,
      polygon: false,
      rectangle: false,
      circle: false,
      marker: false,
      circlemarker: false
    };

    switch (layer.geometryType) {
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
      edit: layer.geometryType === "Point"
    };

    return {
      position: 'topright',
      draw: drawOptions,
      edit: editOptions
    };
  }

  onCreated(id, e) {
    const { store } = this.context;

    let { layer } = e;
    let feature = layer.toGeoJSON();

    let created = Object.assign({}, feature, {
      uuid: UUID.generate()
    });

    layer.remove();

    store.dispatch(addFeatures(id, [ created ]));
  }

  onEdited(id, e) {
    const { store } = this.context;

    let { layers } = e;
    let { features } = layers.toGeoJSON();

    let edited = features.map(feature => {
      return Object.assign({}, feature, {
        uuid: UUID.generate()
      });
    })

    store.dispatch(updateFeatures(id, edited));
  }


  onDeleted(id, e) {
    const { store } = this.context;
    
    let { layers } = e;
    
    let deleted = layers.getLayers().map(layer => layer.options.uuid)

    store.dispatch(deleteFeatures(id, deleted));
  }

  render() {
    let { layers, extent, editableLayer } = this.state;

    layers = layers.map(layer => Object.assign({}, layer));
    
    let editLayer = layers.find(layer => layer.id === editableLayer);

    let boundedOnEdited = this.onEdited.bind(this, editableLayer);
    let boundedOnCreated = this.onCreated.bind(this, editableLayer);
    let boundedOnDeleted = this.onDeleted.bind(this, editableLayer);

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
                    key={layer.id}>
                    <EditControl
                      position='topright'
                      onEdited={boundedOnEdited}
                      onCreated={boundedOnCreated}
                      onDeleted={boundedOnDeleted}
                      {...this.createEditControlOptions(layer)}
                    />
                    {
                      layer.data
                        .map((feature, key) => {

                          let { geometry, uuid } = feature;
                          let options = Object.assign({
                            key,
                            uuid
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

MapController.contextTypes = {
  store: PropTypes.object
};