import { ADD_LAYER, REMOVE_LAYER, TOGGLE_LAYER } from './actions';

var ID_INCREMENTER = 0;

const initialState = {
  layers: []
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

    default:
      return state;
  }
}