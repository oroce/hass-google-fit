import React from 'react';
import { GoogleLogin } from 'react-google-login';
const config = {
  clientId:
    '643772840013-7b037obqd4o1040nh1po8710fe6ifjlm.apps.googleusercontent.com',
  scope: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read'
  ].join(' ')
};
class AddGoogle extends React.Component {
  onSuccess(resp) {
    this.props.onAuthenticate({
      profile: resp.profileObj,
      token: resp.accessToken,
      googleId: resp.googleId
    });
  }
  onFailure(resp) {
    console.error(resp);
  }
  render() {
    return (
      <GoogleLogin
        clientId={config.clientId}
        scope={config.scope}
        buttonText="Login"
        uxMode="popup"
        onSuccess={resp => this.onSuccess(resp)}
        onFailure={this.onFailure}
        discoveryDocs="https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest"
        isSignedIn={ true }
      >
        <span>Add new google Fit</span>
      </GoogleLogin>
    );
  }
}
export default AddGoogle;
