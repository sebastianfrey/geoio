import React from 'react';

export default class Header extends React.Component {
  render() {

    const imgStyle = { width: '2.5rem', paddingLeft: '1.25rem'};

    return (
      <div className="header">
        <div className="title">{this.props.title}</div>
        <img src="images/logo.png" alt="" style={imgStyle}/>
      </div>
    );
  }
}