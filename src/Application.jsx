import React from 'react';
import Table from './Table.jsx';
import Header from './Header.jsx';
import Layer from './Layer.jsx';
import MapController from './MapController.jsx';
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