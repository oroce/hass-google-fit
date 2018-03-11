// I'm begging you, give me pls a simple fetch wrapper
import qs from 'querystring';
function get(url, opts = {}) {
  let finalUrl = url;
  if (opts.qs) {
    finalUrl = url + '?' + qs.stringify(opts.qs);
  }
  const headers = opts.headers || {};
  const json = opts.json;
  delete opts.headers;
  delete opts.qs;
  delete opts.json;
  const promise = fetch(finalUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...opts
  }).then(resp => {
    if (resp.status > 399) {
      throw new Error('Error: ' + resp.status);
    }
    return resp;
  });
  if (json) {
    return promise.then(resp => resp.json());
  }

  return promise;
}
function msTo64bitInt(ms) {
  return String(ms) + 1e5;
}
export function loadStateForToken(tokenObj) {
  //return { type: 'DUMMY' };
  const now = Date.now();
  const aWeekAgo = now - (1000 * 60 * 60 * 24 * 7);
  const datasetId = `${msTo64bitInt(aWeekAgo)}-${msTo64bitInt(now)}`;
  const dataSource = 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps';
  const promise = get(
    `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSource}/datasets/${datasetId}`,
    {
      qs: {
        access_token: tokenObj.token
      },
      json: true
    }
  );
  return dispatch => {
    dispatch({
      type: 'STEP_COUNT_LOAD',
      payload: promise,
      meta: {
        statsLoadingForUser: tokenObj.user
      }
    });
  };
}

export function addToken(user, token) {
  return {
    type: 'TOKEN_ADD',
    payload: {
      user,
      token
    }
  };
}
export function addUser(user) {
  return {
    type: 'USER_ADD',
    payload: user
  };
}
