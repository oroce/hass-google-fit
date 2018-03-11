import React from 'react';
const SECOND_IN_MS = 1e3;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
class Stat extends React.Component {
  static displayName = 'Stat'
  calculateLastNDays(days) {
    // TODO: what if i check the number at 6am? then days should be 0.25 days
    const now = Date.now();
    const DIFF_DAYS_IN_MS = days * DAY_IN_MS;
    return this.props.items
      .filter(item => {
        return (now - item.start) < DIFF_DAYS_IN_MS;
      })
      .reduce((sum, item) => sum + item.value, 0);
  }
  render() {
    return (
      <div>
        <strong>{ this.props.user.name }</strong>
        <br />
        Last 7 days: <strong>{ this.calculateLastNDays(7) } steps</strong>
        <br />
        Today: <strong>{ this.calculateLastNDays(1) } steps</strong>
      </div>
    )
  }
};

export default Stat;