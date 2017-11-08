import React from 'react';


import Container from './Container';

import { Provider } from 'react-redux';
import { configureStore } from './core/reducers';



const store = configureStore();

export default class Application extends React.Component {

  render() {
    return (
      <Provider store={store}>
        <Container />
      </Provider>
    );
  }
}