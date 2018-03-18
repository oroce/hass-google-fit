import { connect } from 'react-redux';
import * as actions from '../actions';
import Stats from '../components/Stats';
import { format } from 'date-fns';
import values from 'lodash.values';
const findUser = (userId, state) => {
  return state.users.find(user => user.id === userId);
};
const mapStateToProps = state => {
  const pendingUsers = state.statsPending.map(userId => findUser(userId, state)).filter(item => item != null);
  const stepsByUser = state.steps.reduce((grp, stat) => {
    if (!grp[stat.user]) {
      grp[stat.user] = {
        user: findUser(stat.user, state),
        items: []
      };
    }
    grp[stat.user].items.push(stat);
    return grp;
  }, {});
  const weightsByUser = state.weights.reduce((grp, stat) => {
    if (!grp[stat.user]) {
      grp[stat.user] = {
        user: findUser(stat.user, state),
        items: []
      };
    }
    grp[stat.user].items.push(stat);
    return grp;
  }, {});
  const sleeps = state.sessions.filter(session => {
    return ['LIGHT_SLEEP', 'DEEP_SLEEP'].includes(session.type);
  }).reduce((grp, session) => {
    const duration = session.end - session.start;
    if (!grp[session.user]) {
      grp[session.user] = {
        user: findUser(session.user, state),
        sleeps: [{
          duration,
          start: session.start,
          end: session.end
        }],
        deepSleeps: session.type === 'DEEP_SLEEP' ? duration : 0,
        lightSleeps: session.type === 'LIGHT_SLEEP' ? duration : 0
      };
      // first item probably
      return grp;
    }

    if (session.type === 'DEEP_SLEEP') {
      grp[session.user].deepSleeps += duration;
    }
    if (session.type === 'LIGHT_SLEEP') {
      grp[session.user].lightSleeps += duration;
    }
    const sleeps = grp[session.user].sleeps;
    const last = sleeps[sleeps.length - 1];
    const minute30 = 30 * 60 * 1000;


    const diff = session.start - last.end;

    if (diff < minute30) {
      grp[session.user].sleeps[sleeps.length - 1].duration += duration;
      grp[session.user].sleeps[sleeps.length - 1].end = session.end;
    } else {
      grp[session.user].sleeps.push({
        start: session.start,
        end: session.end,
        duration
      });
    }

    return grp;
  }, {});
  return {
    steps: values(stepsByUser),
    weights: values(weightsByUser),
    tokens: state.tokens,
    pendingUsers,
    sleepByUsers: values(sleeps)
  };
  return {
    stats: [], tokens: [], pendingUsers: [], sleepByUsers: []
  };
};

const mapDispatchToProps = dispatch => {
  return {
    loadStats: () => {
      dispatch(actions.loadStats());
    }
  };
};

const StatsContainer = connect(mapStateToProps, mapDispatchToProps)(Stats);

export default StatsContainer;
