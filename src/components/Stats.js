import React from 'react';
import Stat from './Stat';
class Stats extends React.Component {
  static displayName = 'Stats';
  componentDidMount() {
    console.log('componentDidMount')
    this.props.loadStats();
  }
  renderEmpty() {
    return <div>No Google Fit has been added yet</div>;
  }
  renderSteps() {
    if (this.props.steps.length === 0) {
      return this.renderEmpty();
    }
    return this.props.steps.map((stat, ndx) => {
      return <Stat key={`stat-item${ndx}`} {...stat} />;
    });
  }
  renderSleeps() {
    if (this.props.sleepByUsers.length === 0) {
      return (<div>no sleep data yet</div>);
    }
    const byMe = this.props.sleepByUsers[0]; 
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>start</th>
              <th>end</th>
              <th>duration</th>
            </tr>
          </thead>
          <tbody>
          { byMe.sleeps.map((sleep) => {
            return (
              <tr>
                <td>{ new Date(sleep.start).toJSON() }</td>
                <td>{ new Date(sleep.end).toJSON() }</td>
                <td>{ (sleep.duration / (1000 * 60 * 60)).toPrecision(3) }</td>
              </tr>
            );
          }) }
          </tbody>
        </table>
        <div>deep sleeps: { (byMe.deepSleeps / (1000 * 60 * 60)).toPrecision(3) }</div>
        <div>light sleeps: { (byMe.lightSleeps / (1000 * 60 * 60)).toPrecision(3) }</div>
      </div>
    );
    return (<pre><code>{ JSON.stringify(this.props.sleeps, null, 2) }</code></pre>);
  }
  renderWeights() {
    if (this.props.weights.length === 0) {
      return <div>no weights data yet</div>;
    }
    return (
      <div>
        { this.props.weights.map(weight => {
          return (<span>{ JSON.stringify(weight, null, 2) }</span>);
        }) }
      </div>
    );
  }
  renderPending() {
    if (this.props.pendingUsers.length === 0) {
      return null;
    }
    return (
      <span>Downloading is in progress for { this.props.pendingUsers.map(user => user.name).join(', ') }</span>
    );
  }
  render() {
    return (
      <div>
        { this.renderSteps() }
        { this.renderSleeps() }
        { this.renderWeights() }
        { this.renderPending() }
      </div>
    );
  }
}

export default Stats;
