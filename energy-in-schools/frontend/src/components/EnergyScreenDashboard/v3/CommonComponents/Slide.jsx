import React from 'react';

import Loader from '../../common/SlideLoad/Loader';

import LoadingFailed from './LoadingFailed';

import { hasNullableProp } from '../../constants';

export default class Slide {
  constructor(mainComponent, componentExtraProps, notRequiredParamsList, slideKeys, invokeActions, loadingFailedProps) {
    this.mainComponent = mainComponent;
    this.componentExtraProps = componentExtraProps;
    this.notRequiredParamsList = notRequiredParamsList;
    this.slideKeys = slideKeys;
    this.invokeActions = invokeActions;
    this.loadingFailedProps = loadingFailedProps;
  }

  renderMain(parameters, status, loadingFailedProps) {
    /* eslint no-underscore-dangle: ["error", { "allow": ["_renderComponent"] }] */
    return Slide._renderComponent(
      this.mainComponent,
      { ...parameters, ...this.componentExtraProps },
      this.notRequiredParamsList,
      status,
      { ...loadingFailedProps },
    );
  }

  static _renderComponent(component, parameters, notRequiredParamsList, loadingEnds, loadingFailedProps) {
    const containsNull = hasNullableProp(parameters);
    if (containsNull) {
      if (loadingEnds.status) {
        return React.createElement(Loader, {}, null);
      }
      return hasNullableProp(parameters, notRequiredParamsList)
        ? React.createElement(LoadingFailed, { ...loadingFailedProps }, null)
        : React.createElement(component, { ...parameters }, null);
    }
    return React.createElement(component, { ...parameters }, null);
  }
}
