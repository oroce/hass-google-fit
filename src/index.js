import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import { save, load } from 'redux-localstorage-simple';
import promiseMiddleware from 'redux-promise-middleware';
import reducers from './reducers';
import App from './components/App';

// FIXME: hack, stolen from: https://github.com/anthonyjgrove/react-google-login/issues/131
const head = document.getElementsByTagName('head')[0];
head.appendChild(document.createElement('script'));
const storageConfig = {
  states: ['tokens', 'users'],
  namespace: 'stepper'
};
const middlewares = [
  store => next => action => {
    console.log('my middleware', action);
    return next(action);
  },
  thunk,
  save({ ...storageConfig, debounce: 500 }),
  promiseMiddleware()
];
let composeEnhancers = compose;
if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({});
}
const enhancer = composeEnhancers(applyMiddleware(...middlewares));

const store = createStore(
  reducers,
  load({
    ...storageConfig,
    preloadedState: {
      stats: [],
      tokens: [],
      users: [],
      statsPending: []
    }
  }),
  enhancer
);
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
