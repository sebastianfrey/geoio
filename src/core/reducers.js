import { createStore, combineReducers } from 'redux';

import { ADD_LAYER, REMOVE_LAYER, UPDATE_LAYER, EDIT_LAYER, TOGGLE_LAYER,
  ZOOM_TO_LAYER, MOVE_LAYER_DOWN, MOVE_LAYER_UP, ADD_FEATURES, UPDATE_FEATURES,
  DELETE_FEATURES } from './actions';

import L from 'leaflet';

import { reducer as notifications } from 'react-notification-system-redux';

var ID_INCREMENTER = 0;

const corner1 = L.latLng(40.712, -74.227),
corner2 = L.latLng(40.774, -74.125),
bounds = L.latLngBounds(corner1, corner2);

const initialState = {
  layers: [],
  extent: bounds,
  editableLayer: -1
}

function extent(state = bounds, action) {
  
  switch (action.type) {

    case ZOOM_TO_LAYER: {
      return action.extent;
    }

    default: {
      return state;
    }
  }
}

function editableLayer(state = -1, action) {
  
  switch (action.type) {

    case EDIT_LAYER: {
      return action.id;
    }

    default: {
      return state;
    }

  }
}

function layers(state = [], action) {

  switch (action.type) {

    case ADD_LAYER: {

      return  [
        ...state,
        Object.assign({}, action.layer, { id: ID_INCREMENTER++ })
      ];
    }

    case REMOVE_LAYER: {
      return state
        .filter((layer) => {
          return action.id !== layer.id;
        }).map((layer) => {
          return Object.assign({}, layer);
        });
    }

    case UPDATE_LAYER: {
      return state
        .map((layer) => {
          let changes = {};

          if (layer.id === action.id) {
            changes = Object.assign(changes, action.changes);
          }

          return Object.assign({}, layer, changes);
        });
    }

    case TOGGLE_LAYER: {
      return state
        .map((layer) => {
          if (layer.id === action.id) {
            layer.visible = !layer.visible;
          }
          return Object.assign({}, layer);
        });
    }

    case MOVE_LAYER_UP: {

      let layers = state.map(layer => Object.assign({}, layer));

      let layerIdx = layers.findIndex(layer => layer.id === action.id);

      if (layerIdx === 0) return layers;

      layers.splice(layerIdx - 1, 0, layers.splice(layerIdx, 1)[0]);

      return layers;
    }

    case MOVE_LAYER_DOWN: {

      let layers = state.map(layer => Object.assign({}, layer));

      let layerIdx = layers.findIndex(layer => layer.id === action.id);

      if (layerIdx + 1 === layers.length) return state;

      layers.splice(layerIdx + 1, 0,layers.splice(layerIdx, 1)[0]);

      return layers;
    }

    case ADD_FEATURES: {
      return state
        .map((layer) => {

          if (layer.id === action.id) {
            return Object.assign({}, layer, {
              data: layer.data
                .concat(action.features)
            });
          }

          return layer;
        });
    }

    case UPDATE_FEATURES: {
      return state
        .map((layer) => {

          if (layer.id === action.id) {
            let uuids = action.features.map(feature => feature.uuid);

            return Object.assign({}, layer, {
              data: layer.data
                .filter(feature => !uuids.includes(feature.uuid))
                .concat(action.features)
            });
          }

          return layer;
        })
    }

    case DELETE_FEATURES: {
      return state
        .map((layer) => {
          
          if (layer.id === action.id) {
            return Object.assign({}, layer, {
              data: layer.data
                .filter(feature => !action.ids.includes(feature.uuid))
            });
          }

          return layer;
        });
    }

    default:
      return state;
  }
}


export function configureStore() {
  return createStore(
    combineReducers({
      layers,
      editableLayer,
      extent,
      notifications
    }),
    initialState
  );
}