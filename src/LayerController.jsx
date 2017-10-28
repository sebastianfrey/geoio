import React from 'react';

import { hexToRgb, rbgToCss } from './util';

import { toggleLayer } from './map/actions';

export default class LayerController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: [],
      title: props.title
    };
    this.layerStore = props.layerStore;
    this.layerStore.subscribe(this.layerStoreListener.bind(this));
  }

  layerStoreListener() {
    const { layers } = this.layerStore.getState();
    this.setState({ layers });
  }

  render() {
    const { layers } = this.state;
    const { title } = this.props;
    console.log(this.state);
    console.log(this.props);

    return (
      <div className="layer-controller">
        <div className="title">{title}</div>
        <div className="list">
          {
            layers.map((layer) => {
              return (
                <LayerElement key={layer.id} layerStore= {this.layerStore} layer={layer}></LayerElement>
              );
            })
          }
        </div>
      </div>
    );
  }
}

class LayerElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: [],
      title: props.title
    };
    this.layerStore = props.layerStore;
    this.layerStore.subscribe(this.layerStoreListener.bind(this));
  }


  layerStoreListener() {
    const { layers } = this.layerStore.getState();
    this.setState({ layers });
  }

  toggleLayer(id) {
    this.layerStore.dispatch(toggleLayer(id));
  }

  render() {
    const { layer } = this.props;
    let rgba = rbgToCss(hexToRgb(layer.color), 0.9);
    let boundedToggleLayer = this.toggleLayer.bind(this, layer.id);

    return (
      <div className="list-entry">
        <input type="checkbox" checked={layer.visible} onChange={boundedToggleLayer}/>
        <div className="layer-color" style={{backgroundColor:rgba, borderColor:layer.color}}/>
        {layer.name}
      </div>
    );
  }
}