import React from 'react';

import PropTypes from "prop-types";

import Header from './Header';
import LayerController from './LayerController';

import MapController from './MapController';

import { connect } from 'react-redux';

import Dropable from './Dropable';

import Notifications from 'react-notification-system-redux';

const DropableMapController = Dropable(MapController);

let loadingMessages = [
  'Calibrating gravity',
  'Loading atmosphere',
  'Fastening seat belts',
  'Ready, Set, Go!'
];

let timeout = 200;

export class Container extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      message: "",
      loading: true
    };
  }

  componentDidMount() {
    this.displayLoadingMessages(); 
  }

  displayLoadingMessages() {
    let message = loadingMessages.shift();
    
    this.setState({
      message: message
    });    

    setTimeout(() => {
      if (loadingMessages.length > 0) {
        this.displayLoadingMessages();
      } else {
        this.setState({ loading: false });
      }
    }, timeout);
    timeout += 100;
  }

  render() {
    const { notifications } = this.props;
    const { message, loading } = this.state;

    const style = {
      NotificationItem: {
        error: {
          color: 'red'
        }
      }
    };

    return (
      <div className={loading ? 'main loading' : 'main'}>
        <div className="loading-overlay">
          <div className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <img className="loading-image" src="images/logo-large.png" alt="" 
            style={{width: '192px'}}/>
          <div className="loading-message">{message}</div> 
        </div>
        <div className="container">
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