import React from 'react';
import ReactDOM from 'react-dom';

import './DropDown.css';

import Icon from 'react-icons-kit';

export class DropDownIcon extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      focused: false
    }
    this.boundedMouseDown = this.handleMouseDown.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.boundedMouseDown);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.boundedMouseDown);
  }

  handleMouseDown(e) {
    const { dropDownMenu, dropDownIcon } = this.refs;

    if (dropDownMenu.isVisible() && !dropDownIcon.contains(e.target)) {
      dropDownMenu.hide();
    }

  }

  handleIconClick(e) {
    const { dropDownMenu } = this.refs;

    if (dropDownMenu.isVisible())
      dropDownMenu.hide();
    else
      dropDownMenu.show();    
  }

  handleDropDownMenuClick(menu) {
    const { dropDownMenu } = this.refs;    

    if (!menu.isDisabled()) dropDownMenu.hide();
  }


  render() {
    const { icon, iconSize, children, onHide, onShow } = this.props;    

    let boundedIconClick = this.handleIconClick.bind(this);
    let boundedDropDownMenuClick = this.handleDropDownMenuClick.bind(this);

    return (
      <div ref="dropDownIcon">
        <Icon
          onClick={boundedIconClick}
          icon={icon}
          size={iconSize} />
        <DropDownMenu ref="dropDownMenu"
          onMenuItemClick={boundedDropDownMenuClick}
          onHide={onHide}
          onShow={onShow}
          dropDownStyle={{ width: "10rem" }}> 
          {children}
        </DropDownMenu>
      </div>
    );
  }
}

export class DropDownMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
    
    let { onHide = () => {}, onShow = () => {} }  = props;

    this.onHide = onHide;
    this.onShow = onShow;
  }

  isVisible() {
    let { visible } = this.state;

    return visible;
  }

  toggle() {
    let { visible } = this.state;


    this.setState({
      visible: !visible
    });
  }

  hide() {
    this.setState({
      visible: false
    });
    this.onHide()
  }

  show() {
    this.setState({
      visible: true
    });
    this.onShow()
  }

  render() {
    let { visible } = this.state;
    let { dropDownStyle = {}, onMenuItemClick = () => {}, children } = this.props;

    let menuItems = React.Children.map(children, menuItem => {
      return React.cloneElement(menuItem, {
        _onClick: onMenuItemClick
      });
    });

    return (
      <div className="dropdown">
        <div className={`dropdown-menu ${visible ? 'show' : ''}`}
          style={dropDownStyle}>
          {menuItems}
        </div>
      </div>
    );
  }
}

export class DropDownItem extends React.Component {

  handleOnClick() {
    const { onClick = () => {}, _onClick = () => {} } = this.props;
    onClick(this);
    _onClick(this);
  }

  isDisabled() {
    let { disabled } = this.props;

    return disabled;
  }


  render() {
    let { label, icon, iconStyle = {}, iconSize = 20, disabled = false} = this.props;  

    let boundedHandleClick = this.handleOnClick.bind(this);

    return (
      <div className={`dropdown-item ${disabled ? 'disabled' : ''}`}
        onClick={boundedHandleClick}>
        {icon ? <Icon icon={icon} style={iconStyle} size={iconSize} /> : ''}
        <div className="label">{label}</div>
      </div>
    );
  }
}

export class DropDownSeparator extends React.Component {
  render() {
    return (
      <div className="dropdown-separator" />
    );
  }
}