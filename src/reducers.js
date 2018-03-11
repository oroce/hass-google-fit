import uniqBy from 'lodash.uniqby';
export default (state, action) => {
  console.log('reducer', action);
  const { type, payload } = action;

  switch (type) {
    case 'USER_ADD':
      return {
        ...state,
        users: state.users.concat(payload),
      };
    case 'TOKEN_ADD':
      return {
        ...state,
        tokens: uniqBy([payload].concat(state.tokens), item => {
          return item.user;
        }),
      };
    case 'STEP_COUNT_LOAD_PENDING': 
      return { ...state, statsPending: uniqBy(state.statsPending.concat(action.meta.statsLoadingForUser), item => item) };
    case 'STEP_COUNT_LOAD_FULFILLED':
      return {
        ...state,
        stats: payload.point.map(item => {
          return {
            start: item.startTimeNanos / 1e6,
            end: item.endTimeNanos / 1e6,
            value: item.value.reduce((sum, val) => sum + val.intVal, 0),
            user: action.meta.statsLoadingForUser
          };
        }),
        statsPending: state.statsPending.filter(user => user !== action.meta.statsLoadingForUser)
      }
    default:
      return state;
  }
};
