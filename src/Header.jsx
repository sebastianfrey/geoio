import React from 'react';

export default class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <div className="title">{this.props.title}</div>
      </div>
    );
  }
}