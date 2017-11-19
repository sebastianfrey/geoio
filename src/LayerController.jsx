import React from 'react';

import PropTypes from "prop-types";

import { ChromePicker } from "react-color";

import { ic_more_horiz, ic_add, ic_perm_data_setting } from 'react-icons-kit/md'; 

import Icon from 'react-icons-kit';

import { ic_box } from "./icons/icons";

import L from 'leaflet';

import { hexToRgb, rgbToCss } from './colorUtil';

import { toggleLayer, removeLayer, zoomToLayer,
  moveLayerDown, moveLayerUp, updateLayer, editLayer } from './core/actions';

import { DropDownIcon, DropDownItem, DropDownSeparator } from './ui/DropDown'
import AddLayerForm from "./ui/form/AddLayerForm.jsx";
import GeometryProcessingForm from "./ui/form/GeometryProcessingForm.jsx"


export default class LayerController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: [],
      title: props.title,
      content: "LAYER_TREE",
      loading: false
    };
  }

  componentWillMount() {
    const { store } = this.context;

    this.unsubscribe = store.subscribe(this.storeListener.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  storeListener() {
    const { store } = this.context;

    const { layers, processing } = store.getState();
    this.setState({ layers, loading: processing > 0 });
  }

  onSubmitAddLayer() {

  }

  onCancelAddLayer() {

  }

  renderContentView(content) {
    let { layers } = this.state;
    const { title } = this.props;


    switch (content) {
      case "ADD_LAYER":
        return (
          <div className="content">
            <AddLayerForm
              onSubmit={() => { this.setState({content: "LAYER_TREE"})}}
              onCancel={() => { this.setState({content: "LAYER_TREE"})}}/>
          </div>
        );

      case "PROCESSING":
        return (
          <div className="content">
            <GeometryProcessingForm
              onSubmit={() => { this.setState({content: "LAYER_TREE"})}}
              onCancel={() => { this.setState({content: "LAYER_TREE"})}}/>
          </div>
        );
      
        case "LAYER_TREE":
        default:
          return (
            <div className="content">
            
              <div className="title">{title}</div>
              <div className="layer-list">
                {
                  layers.map((layer, i) => {
                    return (
                      <LayerElement
                        key={layer.id}
                        layerIdx={i}
                        layer={layer} />
                    );
                  })
                }
              </div>
            </div>
          );
    }
  }

  renderToolbar(content) {
    if (content === "LAYER_TREE") {
      return (
        <div className="toolbar">
          <Icon icon={ic_add} className="ic_green ic_padding_5 ic_flex"
            title="Add a new Layer"
            onClick={() => { this.setState({content: "ADD_LAYER"}) }} />
          <Icon icon={ic_perm_data_setting} className="ic_padding_5 ic_flex"
            title="Start a Geoprocessing operation"
            onClick={() => { this.setState({content: "PROCESSING"}) }} />
        </div>
      );
    } else {
      return (<div></div>)
    }

  }

  render() {
    let { content, loading } = this.state;

    return (
      <div className={`layer-controller ${this.props.right ? "right" : ""}`}>
        {this.renderToolbar(content)}
        {this.renderContentView(content)}
        <div className={loading ? "loader":""}></div>
      </div>
    );
  }
}

LayerController.contextTypes = {
  store: PropTypes.object
};

class LayerElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      layerCount: 0,
      editableLayer: -1,
      nameInputActive: false
    };
  }

  componentWillMount() {
    const { store } = this.context;

    this.unsubscribe = store.subscribe(this.storeListener.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  componentDidUpdate() {
    const { nameInputActive } = this.state;
    const { nameInput } = this.refs;

    if (nameInputActive) {
      nameInput.focus()
    }
  }


  storeListener() {
    const { store } = this.context;

    const { layers, editableLayer } = store.getState();

    this.setState({
      layerCount: layers.length,
      editableLayer
    });
  }

  toggleLayer(id) {
    const { store } = this.context;

    store.dispatch(toggleLayer(id));
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

  onLayerNameKeyDown(id, e) {
    if (e.keyCode !== 13) return;

    this.onLayerNameChange(id, e);
  }

  onLayerNameChange(id, e) {
    const { store } = this.context;

    const { nameInputActive } = this.state;
    let { value } = e.target;
    const { nameInput } = this.refs;

    if (!nameInputActive) return;

    if (value === "") {
      value = nameInput.defaultValue;
    }
    
    nameInput.value = value;
    nameInput.defaultValue = value;

    
    store.dispatch(updateLayer(id, { name: value }));
    
    this.setState({
      nameInputActive: false
    });
  }

  onLayerColorChange(id, color) {
    const { store } = this.context;

    store.dispatch(updateLayer(id, { color: color.hex }));
  }

  editLayer(id) {
    const { store } = this.context;

    const { editableLayer } = this.state;

    if (editableLayer === id) {
      id = -1;
    }

    store.dispatch(editLayer(id));
  }

  removeLayer(id) {
    const { store } = this.context;

    store.dispatch(removeLayer(id));
  }

  moveLayerUp(id) {
    const { store } = this.context;

    store.dispatch(moveLayerUp(id));
  }

  moveLayerDown(id) {
    const { store } = this.context;

    store.dispatch(moveLayerDown(id));
  }

  zoomToLayer(extent) {
    const { store } = this.context;

    const {xmin, ymin, xmax, ymax } = extent;
    const ll = L.latLng(ymin, xmin), ur = L.latLng(ymax, xmax);

    store.dispatch(zoomToLayer(L.latLngBounds(ll, ur)));
  }

  render() {

    const { layer, layerIdx } = this.props;
    const { active, layerCount, nameInputActive, editableLayer } = this.state;

    let isFirst = layerIdx > 0;
    let isLast = layerIdx + 1 < layerCount;

    let isEditable = editableLayer === -1;
    let isEditableLayer = !isEditable && editableLayer === layer.id;

    let rgba = rgbToCss(hexToRgb(layer.color), 0.7);

    let boundedToggleLayer = this.toggleLayer.bind(this, layer.id);
    let boundedRemoveLayer = this.removeLayer.bind(this, layer.id);
    let boundedZoomToLayer = this.zoomToLayer.bind(this, layer.extent);
    let boundedEditLayer = this.editLayer.bind(this, layer.id);
    let boundedMoveLayerUp = this.moveLayerUp.bind(this, layer.id);
    let boundedMoveLayerDown = this.moveLayerDown.bind(this, layer.id);
    let boundedLayerNameDblClick = this.onLayerNameDoubleClick.bind(this, layer);
    let boundedLayerNameChange = this.onLayerNameChange.bind(this, layer.id);
    let boundedLayerColorChange = this.onLayerColorChange.bind(this, layer.id);
    let boundedLayerNameKeyDown = this.onLayerNameKeyDown.bind(this, layer.id);
    let boundedOnHide = this.onHide.bind(this);
    let boundedOnShow = this.onShow.bind(this);

    return (
      <div key={layer.id}
        className={`layer-entry ${active ? 'active' : ''}`}>
        <input type="checkbox" checked={layer.visible} onChange={boundedToggleLayer}/>
        <DropDownIcon className="layer-color"
          iconSize={16}
          icon={ic_box}
          iconStyle={{backgroundColor: rgba, border: `1px solid ${layer.color}`}}>
          <ChromePicker color={layer.color} disableAlpha={true}
            onChangeComplete={boundedLayerColorChange}/>
        </DropDownIcon>
        <input autoFocus className={`layer-name ${nameInputActive ? 'active' : ''}`} type="text"
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
          className="layer-menu"
          dropDownStyle={{ width: "10rem" }}>
            <DropDownItem label={"Zoom to Layer"} onClick={boundedZoomToLayer}/>
            <DropDownItem disabled={!(isEditable || isEditableLayer)} label={`${isEditableLayer ? "Stop edit Layer": "Start edit Layer"}`} onClick={boundedEditLayer} />
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

LayerElement.contextTypes = {
  store: PropTypes.object
};