import React from 'react';

import { PropTypes } from "prop-types";

import './Form.css';

import ConvexHull from './processing/ConvexHull.jsx';

import { processingStarted, processingStopped } from "../../core/actions";

import Notifications from "react-notification-system-redux";

export default class GeometryProcessingForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      type: "convex_hull"
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

/*   componentWillMount() {
    const { store } = this.context;

    this.unsubscribe = store.subscribe(this.handleStateChange.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  handleStateChange() {

  } */

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleCancel(event) {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleSubmit(event) {
    const { onSubmit } = this.props;
    const { process } = this.refs;
    const { store } = this.context;

    if (process && process.run) {
      store.dispatch(processingStarted())
      process.run()
        .catch((e) => {
          store.dispatch(Notifications.error({
            title: "Processing error",
            message: e.message,
            position: "br"
          }));
        })
        .always(() => {
          store.dispatch(processingStopped())
        });
    }

    if (onSubmit)
    {
      onSubmit();
    }
  }

  renderProcessingForm(type) {
    switch (type) {
      case "convex_hull":
        return (<ConvexHull ref="process" />);

      default:
        return (<div></div>);
    }
  }

  render() {
    const { state, handleInputChange, handleSubmit, handleCancel } = this;

    return (
      <div className="form processing">
        <div className="row">
          <div className="title">
            Geometry Processing
          </div>
        </div>

        <div className="row">
          <label>
            Process
          </label>
          <select value={state.type}
              onChange={handleInputChange}>
              <option value="convex_hull">Convex Hull</option>
          </select>
        </div>

        {this.renderProcessingForm(state.type)}

        <div className="row rtl">
          <label></label>
          <button onClick={handleSubmit}>Start</button>
          <button onClick={handleCancel}>Cancel </button>
        </div>
      </div>
    );
  }
}

GeometryProcessingForm.contextTypes = {
  store: PropTypes.object
};

GeometryProcessingForm.propTypes = {
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func
};