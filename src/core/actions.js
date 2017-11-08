export const ADD_LAYER = 'ADD_LAYER';
export const REMOVE_LAYER = 'REMOVE_LAYER';
export const UPDATE_LAYER = 'UPDATE_LAYER';
export const EDIT_LAYER = 'EDIT_LAYER';
export const MOVE_LAYER_UP = 'MOVE_LAYER_UP';
export const MOVE_LAYER_DOWN = 'MOVE_LAYER_DOWN';
export const TOGGLE_LAYER = 'TOGGLE_LAYER';
export const ZOOM_TO_LAYER = 'ZOOM_TO_LAYER';
export const ADD_FEATURES = 'ADD_FEATURES';
export const UPDATE_FEATURES = 'UPDATE_FEATURES';
export const DELETE_FEATURES = 'DELETE_FEATURES';

export function addLayer(layer) {
  return {
    type: ADD_LAYER,
    layer
  };
}

export function updateLayer(id, changes) {
  return {
    type: UPDATE_LAYER,
    id,
    changes
  };
}

export function editLayer(id) {
  return {
    type: EDIT_LAYER,
    id
  };
}

export function removeLayer(id) {
  return {
    type: REMOVE_LAYER,
    id
  };
}

export function toggleLayer(id) {
  return {
    type: TOGGLE_LAYER,
    id
  };
}

export function moveLayerUp(id) {
  return {
    type: MOVE_LAYER_UP,
    id
  };
}

export function moveLayerDown(id) {
  return {
    type: MOVE_LAYER_DOWN,
    id
  };
}

export function zoomToLayer(extent) {
  return{
    type: ZOOM_TO_LAYER,
    extent
  };
}

export function addFeatures(id, features) {
  return {
    type: ADD_FEATURES,
    id,
    features
  }
}

export function updateFeatures(id, features) {
  return {
    type: UPDATE_FEATURES,
    id,
    features
  };
}

export function deleteFeatures(id, ids) {
  return {
    type: DELETE_FEATURES,
    id,
    ids
  }
}