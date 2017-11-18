import React from 'react';

import { PropTypes } from "prop-types";

import './Form.css';

import { featureSetToLayer } from "../../mapUtil";

import { addLayer } from "../../core/actions";

var NEW_LAYER_COUNTER = 0;

export default class AddLayerForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: `New Layer ${NEW_LAYER_COUNTER++}`,
      geometryType: "Point",
      xmin: 0,
      ymin: 0,
      xmax: 0,
      ymax: 0,
      autoExtent: true
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentWillMount() {
    const { store } = this.context;

    this.unsubscribe = store.subscribe(this.handleStateChange.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  handleStateChange() {
    const { autoExtent } = this.state;

    if (autoExtent) {
      const { mapExtent } = this.context.store.getState();
      this.setState({
        xmin: mapExtent.xmin,
        ymin: mapExtent.ymin,
        xmax: mapExtent.xmax,
        ymax: mapExtent.ymax
      });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    if (name === "autoExtent")  {
      this.handleStateChange();
    }
  }

  handleCancel(event) {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleSubmit(event) {
    const { onSubmit } = this.props;
    const { name, geometryType, xmin, ymin, xmax, ymax } = this.state;
    const { store } = this.context;

    const layer = featureSetToLayer({
      layer: name,
      geometryType,
      features: [],
      extent: { xmin, ymin, xmax, ymax }
    });

    store.dispatch(addLayer(layer));

    this.setState({
      name: `New Layer ${NEW_LAYER_COUNTER++}`
    });

    if (onSubmit)
    {
      onSubmit();
    }
  }

  render() {
    const { state, handleInputChange, handleSubmit, handleCancel } = this;

    return (
      <div className="form add-layer">
        <div className="row">
          <div className="title">
            Create new Layer
          </div>
        </div>
        <div className="row">
          <label>
            Name
          </label>
          <input type="text"
            name="name"
            value={state.name}
            onChange={handleInputChange}/>
        </div>

        <div className="row">
          <label>
            Geometry
          </label>
          <select value={state.geometryType}
              name="geometryType"
              onChange={handleInputChange}>
              <option value="Point">Point</option>
              <option value="Polygon">Polygon</option>
              <option value="MultiLineString">Polyline</option>
          </select>
        </div>

        <div className="row">
          <label>
            Use Map extent
          </label>
          <input name="autoExtent" type="checkbox"
            checked={state.autoExtent}
            onChange={handleInputChange} />
        </div>

        <div className="row">
          <label>
            South West X
          </label>
          <input type="number"
            name="xmin" 
            className={state.autoExtent ? "disabled" : ""}
            disabled={state.autoExtent}
            value={state.xmin}
            onChange={handleInputChange} />          
        </div>

        <div className="row">
          <label>
            South West Y
          </label>
          <input name="ymin"
            type="number"
            className={state.autoExtent ? "disabled" : ""}
            disabled={state.autoExtent}
            value={state.ymin}
            onChange={handleInputChange} />
        </div>

        <div className="row">
          <label>
            North East X
          </label>
          <input type="number"
            name="xmax"
            className={state.autoExtent ? "disabled" : ""}
            disabled={state.autoExtent}
            value={state.xmax}
            onChange={handleInputChange} />
        </div>

        <div className="row">
          <label>
            North East Y
          </label>
          <input type="number"
            name="ymax"
            className={state.autoExtent ? "disabled" : ""}
            disabled={state.autoExtent}
            value={state.ymax}
            onChange={handleInputChange} />
        </div>
        <div className="row rtl">
          <label></label>
          <button onClick={handleSubmit}>Add layer</button>
          <button onClick={handleCancel}>Cancel </button>
        </div>
      </div>
    );
  }
}

AddLayerForm.contextTypes = {
  store: PropTypes.object
};

AddLayerForm.propTypes = {
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func
};