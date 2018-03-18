// I'm begging you, give me pls a simple fetch wrapper
import qs from 'querystring';
import { subDays, format } from 'date-fns';
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
  return new Promise((resolve, reject) => {
    const promise = fetch(finalUrl, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...opts
    }).then(resp => {
      if (resp.status > 399) {
        reject(new Error('Error: ' + resp.status));
      }
      return resp;
    });
    if (json) {
      promise.then(resp => resolve(resp.json()));
      return;
    }
    promise.then(resp => resolve(resp));
  });
}
function msTo64bitInt(ms) {
  return String(ms) + 1e5;
}
export function loadStatForUser(user) {
  const now = Date.now();
  const aWeekAgo = now - (1000 * 60 * 60 * 24 * 7);
  const days7Ago = subDays(now, 7);
  const dataSetId = `${msTo64bitInt(aWeekAgo)}-${msTo64bitInt(now)}`;

  const promiseSteps = get(
    `/users/${user.id}/steps`,
    {
      qs: {
        dataSetId
      },
      json: true
    }
  );
  const promiseWeight = get(
    `/users/${user.id}/weights`,
    {
      qs: {
        dataSetId
      },
      json: true
    }
  );
  const promiseSessions = get(
    `/users/${user.id}/sessions`,
    {
      qs: {
        startTime: `${format(days7Ago, 'YYYY-MM-DD')}T00:00:00.00Z`,
        endTime: `${format(now, 'YYYY-MM-DD')}T23:59:59.00Z`,
      },
      json: true
    }
  );

  return dispatch => {
    dispatch({
      type: 'STEP_COUNT_LOAD',
      payload: promiseSteps,
      meta: {
        forUser: user.id
      }
    });
    dispatch({
      type: 'WEIGHT_LOAD',
      payload: promiseWeight,
      meta: {
        forUser: user.id
      }
    });
    dispatch({
      type: 'SESSIONS_LOAD',
      payload: promiseSessions,
      meta: {
        forUser: user.id
      }
    });
  };
}

export function loadStats() {
  //return;
  return async (dispatch, getState) => {
    const promiseUsers = get('/users', { json: true });
    dispatch({
      type: 'USERS_LOAD',
      payload: promiseUsers
    });
    await promiseUsers;
    
    const { users } = getState();

    for (const user of users) {
      console.log('load data for user', user);
      dispatch(loadStatForUser(user));
    }
  };
}