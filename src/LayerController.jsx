import React from 'react';

import { ic_more_horiz } from 'react-icons-kit/md'; 

import L from 'leaflet';

import { hexToRgb, rgbToCss } from './colorUtil';

import { toggleLayer, removeLayer, zoomToLayer,
  moveLayerDown, moveLayerUp, updateLayer } from './map/actions';

import { DropDownIcon, DropDownItem, DropDownSeparator } from './ui/DropDown'

export default class LayerController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: [],
      title: props.title,
      nameInputActive: false
    };
    this.layerStore = props.layerStore;
    this.layerStore.subscribe(this.layerStoreListener.bind(this));
  }

  layerStoreListener() {
    const { layers } = this.layerStore.getState();
    this.setState({ layers });
  }

  render() {
    let { layers } = this.state;
    const { title } = this.props;

    return (
      <div className={`layer-controller ${this.props.right ? "right" : ""}`}>
        <div className="title">{title}</div>
        <div className="layer-list">
          {
            layers.map((layer, i) => {
              return (
                <LayerElement key={layer.id} layerIdx={i} layerStore= {this.layerStore} layer={layer}></LayerElement>
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
      active: false,
      layerCount: 0
    };
    this.layerStore = props.layerStore;
    this.layerStore.subscribe(this.layerStoreListener.bind(this));
  }


  layerStoreListener() {
    const { layers } = this.layerStore.getState();

    this.setState({
      layerCount: layers.length
    });
  }

  toggleLayer(id) {
    this.layerStore.dispatch(toggleLayer(id));
  }

  onShow(e) {    
    this.setState({
      active: true
    });
  }

  onHide(e) {
    this.setState({
      active: false
    });
  }

  onLayerNameDoubleClick(layer) {
    const { nameInputActive } = this.state;
    
    if (nameInputActive) return;

    this.setState({
      nameInputActive: true
    });
  }

  onLayerNameChange(id, e) {
    const { nameInputActive } = this.state;
    let { value } = e.target;
    const { nameInput } = this.refs;

    if (!nameInputActive) return;

    if (value === "") {
      value = nameInput.defaultValue;      
    }
    
    this.layerStore.dispatch(updateLayer(id, { name: value }));
    
    this.setState({
      nameInputActive: false
    });
  }

  onLayerNameKeyDown(id, e) {
    if (e.keyCode !== 13) return;

    this.onLayerNameChange(id, e);
  }

  removeLayer(id) {
    this.layerStore.dispatch(removeLayer(id));
  }

  moveLayerUp(id) {
    this.layerStore.dispatch(moveLayerUp(id));
  }

  moveLayerDown(id) {
    this.layerStore.dispatch(moveLayerDown(id));
  }

  zoomToLayer(extent) {
    const {xmin, ymin, xmax, ymax } = extent;
    const ll = L.latLng(ymin, xmin), ur = L.latLng(ymax, xmax);

    this.layerStore.dispatch(zoomToLayer(L.latLngBounds(ll, ur)));
  }

  render() {

    const { layer, layerIdx } = this.props;
    const { active, layerCount, nameInputActive } = this.state;

    let isFirst = layerIdx > 0;
    let isLast = layerIdx + 1 < layerCount;

    let rgba = rgbToCss(hexToRgb(layer.color), 0.7);

    let boundedToggleLayer = this.toggleLayer.bind(this, layer.id);
    let boundedRemoveLayer = this.removeLayer.bind(this, layer.id);
    let boundedZoomToLayer = this.zoomToLayer.bind(this, layer.extent);
    let boundedMoveLayerUp = this.moveLayerUp.bind(this, layer.id);
    let boundedMoveLayerDown = this.moveLayerDown.bind(this, layer.id);
    let boundedLayerNameDblClick = this.onLayerNameDoubleClick.bind(this, layer);
    let boundedLayerNameChange = this.onLayerNameChange.bind(this, layer.id);
    let boundedLayerNameKeyDown = this.onLayerNameKeyDown.bind(this, layer.id);
    let boundedOnHide = this.onHide.bind(this);
    let boundedOnShow = this.onShow.bind(this);

    return (
      <div className={`layer-entry ${active ? 'active' : ''}`}>
        <input type="checkbox" checked={layer.visible} onChange={boundedToggleLayer}/>
        <div className="layer-color" style={{backgroundColor: rgba, borderColor:layer.color}}/>
        <input className={`layer-name ${nameInputActive ? 'active' : ''}`} type="text"
          ref="nameInput"
          defaultValue={layer.name}
          onDoubleClick={boundedLayerNameDblClick}
          onBlur={boundedLayerNameChange}
          onKeyDown={boundedLayerNameKeyDown}
          readOnly={!nameInputActive} />
        <DropDownIcon iconSize={20}
          onHide={boundedOnHide}
          onShow={boundedOnShow}
          icon={ic_more_horiz}
          dropDownStyle={{ width: "10rem" }}>
            <DropDownItem label={"Zoom to Layer"} onClick={boundedZoomToLayer}/>
            <DropDownSeparator />
            <DropDownItem disabled={!isFirst} label={"Move Layer up"}
              onClick={boundedMoveLayerUp}/>
            <DropDownItem disabled={!isLast} label={"Move Layer down"}
              onClick={boundedMoveLayerDown}/>
            <DropDownSeparator />
            <DropDownItem label={"Remove Layer"} onClick={boundedRemoveLayer} />
        </DropDownIcon>
      </div>
    );
  }
}