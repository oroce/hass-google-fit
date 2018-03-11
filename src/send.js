import sendAction from 'send-action';

/*
* Create send function
*/
const initialState = JSON.stringify(localStorage.stepper || '{}');
export default sendAction({
  onAction: function(state, action, data) {},
  onChange: function(state, prev) {},
  state: {
    tokens: [],
    ...initialState
  }
});
