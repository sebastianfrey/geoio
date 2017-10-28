export const ADD_LAYER = 'ADD_LAYER';
export const REMOVE_LAYER = 'REMOVE_LAYER';
export const REORDER_LAYER = 'REORDER_LAYER';
export const TOGGLE_LAYER = 'TOGGLE_LAYER';

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