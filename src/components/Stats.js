import React from 'react';
import Stat from './Stat';
class Stats extends React.Component {
  static displayName = 'Stats';
  componentDidMount() {
    this.props.tokens.forEach(item => this.props.loadStateForToken(item));
  }
  renderEmpty() {
    return <div>No Google Fit has been added yet</div>;
  }
  renderStats() {
    if (this.props.stats.length === 0) {
      return this.renderEmpty();
    }
    return this.props.stats.map((stat, ndx) => {
      return <Stat key={`stat-item${ndx}`} {...stat} />;
    });
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
        { this.renderStats() }
        { this.renderPending() }
      </div>
    );
  }
}

export default Stats;
