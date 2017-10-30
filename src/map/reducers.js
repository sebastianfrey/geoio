import { ADD_LAYER, REMOVE_LAYER, UPDATE_LAYER, TOGGLE_LAYER,
  ZOOM_TO_LAYER, MOVE_LAYER_DOWN, MOVE_LAYER_UP } from './actions';

import L from 'leaflet';

var ID_INCREMENTER = 0;

const corner1 = L.latLng(40.712, -74.227),
corner2 = L.latLng(40.774, -74.125),
bounds = L.latLngBounds(corner1, corner2);

const initialState = {
  layers: [],
  extent: bounds
}

export function layerManager(state = initialState, action) {

  switch (action.type) {

    case ADD_LAYER: {

      return Object.assign({}, state, {
        layers: [
          ...state.layers,
          Object.assign({}, action.layer, { id: ID_INCREMENTER++ })
        ]
      });
    }

    case REMOVE_LAYER: {
      return Object.assign({}, state, {
        layers: state.layers.filter((layer) => {
          return action.id !== layer.id;
        })
      });
    }

    case UPDATE_LAYER: {
      return Object.assign({}, state, {
        layers: state.layers.map((layer) => {
          let opts = {};

          if (layer.id === action.id) {
            opts = Object.assign(opts, action.options);
          }

          return Object.assign({}, layer, opts);
        })
      });
    }

    case TOGGLE_LAYER: {
      return Object.assign({}, state, {
        layers: state.layers.map((layer) => {
          if (layer.id === action.id) {
            layer.visible = !layer.visible;
          }
          return Object.assign({}, layer);
        })
      })
    }

    case MOVE_LAYER_UP: {

      let layers = state.layers
        .map(layer => Object.assign({}, layer));

      let layerIdx = layers.findIndex(layer => layer.id === action.id);

      if (layerIdx === 0) return state;

      layers.splice(layerIdx - 1, 0, layers.splice(layerIdx, 1)[0]);

      return Object.assign({}, state, {
        layers: layers
      });
    }

    case MOVE_LAYER_DOWN: {

      let layers = state.layers
        .map(layer => Object.assign({}, layer));

      let layerIdx = layers.findIndex(layer => layer.id === action.id);

      if (layerIdx + 1 === layers.length) return state;

      layers.splice(layerIdx + 1, 0,layers.splice(layerIdx, 1)[0]);

      return Object.assign({}, state, {
        layers: layers
      });
    }

    case ZOOM_TO_LAYER: {
      return Object.assign({}, state, {
        extent: action.extent
      });
    }

    default:
      return state;
  }
}