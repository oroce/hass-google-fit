import { connect } from 'react-redux';
import * as actions from '../actions';
import Stats from '../components/Stats';
const findUser = (userId, state) => {
  return state.users.find(user => user.googleId === userId);
};
const mapStateToProps = state => {
  const pendingUsers = state.statsPending.map(userId => findUser(userId, state)).filter(item => item != null);
  const statsByUser = state.stats.reduce((grp, stat) => {
    if (!grp[stat.user]) {
      grp[stat.user] = {
        user: findUser(stat.user, state),
        items: []
      }
    }
    grp[stat.user].items.push(stat);
    return grp;
  }, {});
  return {
    stats: Object.keys(statsByUser).map(k => statsByUser[k]),
    tokens: state.tokens,
    pendingUsers
  };
};

const mapDispatchToProps = dispatch => {
  return {
    loadStateForToken: token => {
      dispatch(actions.loadStateForToken(token));
    }
  };
};

const StatsContainer = connect(mapStateToProps, mapDispatchToProps)(Stats);

export default StatsContainer;
