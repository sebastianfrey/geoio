import React from 'react';
import PropTypes from 'prop-types';

import { convexHull } from "../../../services/GeometryService";

import { addLayer} from '../../../core/actions';

import { featureSetToLayer } from "../../../mapUtil";

export default class ConvexHull extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      layers: [],
      source: -1
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillMount() {
    const { store } = this.context;

    this.unsubscribe = store.subscribe(this.handleStateChange.bind(this));

    this.handleStateChange();
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  handleStateChange() {
    const { layers } = this.context.store.getState();
    let { source } = this.state;

    source = source === -1 && layers.length > 0 ? layers[0].id : source;

    this.setState({layers, source});
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  async run() {
    const { layers, source } = this.state;
    const { store } = this.context;
        
    let layer = layers.find(l => l.id === source);

    let result = await convexHull({
      type: "FeatureCollection",
      features: layer.data
    })

    result.data.coordinates = [result.data.coordinates];

    store.dispatch(addLayer(featureSetToLayer({
      layer: "convex_hull",
      features: [{ geometry: result.data, properties: {}, type: "Feature"}],
      geometryType: "Polygon",
      extent: {xmin:0,ymin:0,xmax:0,ymax:0}
    })));
  }

  render() {
    const { state, handleInputChange } = this;
    
    return (
      <div className="row">
        <label>
          Source
        </label>
        {
          state.layers.length > 0 ? 
            (
              <select value={state.source}
                name="source"
                onChange={handleInputChange}>
                {state.layers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            )
            :
            (
              <div style={{color:"orange", fontWeight:'bold'}}>No Layer found</div>
            )
        }
      </div>
    )
  }
}

ConvexHull.contextTypes = {
  store: PropTypes.object
};