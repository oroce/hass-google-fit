import uniqBy from 'lodash.uniqby';
export default (state, action) => {
  console.log('reducer', action);
  const { type, payload } = action;

  switch (type) {
    case 'USERS_LOAD_FULFILLED':
      return {
        ...state,
        users: payload
      };
    /*case 'STEP_COUNT_LOAD_PENDING': 
      return { ...state, statsPending: uniqBy(state.statsPending.concat(action.meta.statsLoadingForUser), item => item) };*/
    case 'STEP_COUNT_LOAD_FULFILLED':
      return {
        ...state,
        steps: uniqBy(payload.point.map(item => {
          return {
            id: `u${action.meta.forUser}-s${item.startTimeNanos}`,
            start: item.startTimeNanos / 1e6,
            end: item.endTimeNanos / 1e6,
            value: item.value.reduce((sum, val) => sum + val.intVal, 0),
            user: action.meta.forUser
          };
        }).concat(state.steps), 'id'),
        //statsPending: state.statsPending.filter(user => user !== action.meta.statsLoadingForUser)
      };
    case 'WEIGHT_LOAD_FULFILLED':
      return {
        ...state,
        weights: uniqBy(payload.point.map(item => {
          return {
            id: `u${action.meta.forUser}-s${item.startTimeNanos}`,
            start: item.startTimeNanos / 1e6,
            end: item.endTimeNanos / 1e6,
            value: item.value.reduce((sum, val) => sum + val.fpVal, 0),
            user: action.meta.forUser
          };
        }).concat(state.weights), 'id'),
        //statsPending: state.statsPending.filter(user => user !== action.meta.statsLoadingForUser)
      };
    case 'SESSIONS_LOAD_FULFILLED':
      return {
        ...state,
        sessions: uniqBy(payload.session.map(item => {
          let type;
          if (item.name.startsWith('Deep sleep')) {
            type = 'DEEP_SLEEP';
          }
          if (item.name.startsWith('Light sleep')) {
            type = 'LIGHT_SLEEP';
          }
          return {
            id: item.id,
            start: +item.startTimeMillis,
            startDate: new Date(+item.startTimeMillis),
            endDate: new Date(+item.endTimeMillis),
            end: +item.endTimeMillis,
            type,
            user: action.meta.forUser
          };
        }).filter(item => item.type != null).concat(state.sessions), 'id').sort((a, b) => a.start - b.start)
      };
    default:
      return state;
  }
};
