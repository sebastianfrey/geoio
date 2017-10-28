import React from 'react';
import Table from './Table';
import Header from './Header';
import Layer from './Layer';
import MapController from './MapController';
import { createStore } from 'redux';

function  layerReduxer(layers = [], action) {

};

const layerStore = createStore(layerReduxer);

export default class Application extends React.Component {
  render() {
    return (
      <div className="main">
        <Header  title="GeoIO"/>
        <div className="app-container">
          <Layer /> 
          <div className="content-container">
            <MapController layerStore={layerStore} />
            <Table />
          </div>    
        </div>
      </div>
    );
  }
}