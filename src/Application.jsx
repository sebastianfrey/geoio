import React from 'react';

import { createStore } from 'redux';

import Table from './Table';
import Header from './Header';
import LayerController from './LayerController';

import MapController from './MapController';

import { layerManager } from './map/reducers';

import Dropable from './Dropable';

const DropableMapController = Dropable(MapController);

const layerStore = createStore(layerManager);

export default class Application extends React.Component {
  render() {
    return (
      <div className="main">
        <Header  title="GeoIO"/>
        <div className="app-container">
          <LayerController
            title={"Table of Contents"}
            layerStore={layerStore}
            right={true}/> 
          <div className="content-container">
            <DropableMapController layerStore={layerStore} />
          </div>    
        </div>
      </div>
    );
  }
}