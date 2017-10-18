import Ember from 'ember';
import XHRError from './xhr-error';
import { errorIs } from './bugsnag-skip';

const {
  debug,
  get,
  isNone
} = Ember;

export function getContext(router) {
  const infos = router.currentState.routerJsState.handlerInfos;
  const url = router.get('location').getURL().split('?')[0];
  const routeName = infos[infos.length - 1].name;
  const firstSegments = routeName.replace('.index', '').replace(/\./g, ' ');
  const prettyRouteName = Ember.String.capitalize(firstSegments);

  return `${prettyRouteName} (${routeName}, ${url})`;
}

export function generateError(cause, stack) {
  const error = new Error(cause);

  error.stack = stack;

  return error;
}

export function getError(error) {
  if (!error) {
    return new Error();
  }

  // get jqXHR from rejection triggered by ember-http (RSVP promises).
  if (error.jqXHR) {
    error = error.jqXHR;
  }

  const resource = get(error, 'resource');
  let message;

  // Trace XHR JSON error.
  if (!isNone(message = get(error, 'responseJSON'))) {
    return new XHRError(resource, JSON.stringify(message));
  // Trace XHR Text error.
  } else if (!isNone(message = get(error, 'responseText'))) {
    return new XHRError(resource, message);
  // Trace XHR unknown error.
  } else if (!isNone(message = get(error, 'status'))) {
    const statusText = get(error, 'statusText');

    return new XHRError(resource, `status='${message}' statusText='${statusText}'`);
  // Trace JSON objects.
  } else if (typeof error === 'object') {
    try {
      message = JSON.stringify(error);

      return new Error(message);
    } catch(e) {
      // NOOP.
    }
  }

  return new Error(error);
}

/**
 * Skips the error if any condition is satisfied.
 *
 * @param  {Mixed} error Error caught
 * @return {Boolean} True to skip the error; False to include it.
 */
export function skipError(error, skipErrorTypes = {}) {
  let result = false;

  Object.keys(skipErrorTypes).forEach((name) => {
    if ((skipErrorTypes[name] === true) && (typeof errorIs[name] === 'function') && (errorIs[name](error))) {
      debug(`The error is skipped by fulfilling the condition '${name}'`);
      result = true;

      return;
    }
  });

  return result;
}
