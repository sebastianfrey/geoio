import React from 'react';

import PropTypes from "prop-types";

import Header from './Header';
import LayerController from './LayerController';

import MapController from './MapController';

import { connect } from 'react-redux';

import Dropable from './Dropable';

import Notifications from 'react-notification-system-redux';

const DropableMapController = Dropable(MapController);

export class Container extends React.Component {

  render() {
    const {notifications} = this.props;

    const style = {
      NotificationItem: {
        error: { 
          color: 'red'
        }
      }
    };
    

    return (
      <div className="main">
        <Header  title="GeoIO"/>
        <div className="app-container">
          <LayerController
            title={"Table of Contents"}
            right={true}/> 
          <div className="content-container">
            <DropableMapController />
          </div>    
        </div>
        <Notifications notifications={notifications} style={style} />
      </div>
    );
  }
}

Container.contextTypes = {
  store: PropTypes.object
};

Container.propTypes = {
  notifications: PropTypes.array
}

export default connect(
  state => ({ notifications: state.notifications })
)(Container);