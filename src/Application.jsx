import React from 'react';
import Table from './Table';
import Header from './Header';
import Layer from './Layer';
import MapController from './MapController';
import SplitterLayout from 'react-splitter-layout';

export default class Application extends React.Component {
  render() {
    return (
      <div className="main">
        <Header  title="GeoIO"/>
        <div className="app-container">
          <Layer /> 
          <div className="content-container">
            <MapController />
            <Table />
          </div>    
        </div>
      </div>
    );
  }
}