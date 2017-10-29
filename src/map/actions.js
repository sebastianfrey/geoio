export const ADD_LAYER = 'ADD_LAYER';
export const REMOVE_LAYER = 'REMOVE_LAYER';
export const MOVE_LAYER_UP = 'MOVE_LAYER_UP';
export const MOVE_LAYER_DOWN = 'MOVE_LAYER_DOWN';
export const TOGGLE_LAYER = 'TOGGLE_LAYER';
export const ZOOM_TO_LAYER = 'ZOOM_TO_LAYER';

export function addLayer(layer) {
  return {
    type: ADD_LAYER,
    layer
  }
}

export function removeLayer(id) {
  return {
    type: REMOVE_LAYER,
    id
  }
}

export function toggleLayer(id) {
  return {
    type: TOGGLE_LAYER,
    id
  }
}

export function moveLayerUp(id) {
  return {
    type: MOVE_LAYER_UP,
    id
  }
}

export function moveLayerDown(id) {
  return {
    type: MOVE_LAYER_DOWN,
    id
  }
}

export function zoomToLayer(extent) {
  return{
    type: ZOOM_TO_LAYER,
    extent
  }
}