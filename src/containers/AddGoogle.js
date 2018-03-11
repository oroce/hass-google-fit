import { connect } from 'react-redux';
import * as actions from '../actions';
import AddGoogle from '../components/AddGoogle';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    onAuthenticate: ({ profile, googleId, token }) => {
      dispatch(actions.addToken(googleId, token));
      dispatch(actions.addUser(profile));
    }
  };
};

const AddGoogleContainer = connect(mapStateToProps, mapDispatchToProps)(
  AddGoogle
);

export default AddGoogleContainer;
