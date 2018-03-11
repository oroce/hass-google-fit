import React from 'react';
import Typography from 'material-ui/Typography';
import List, {
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import DirectionsWalk from 'material-ui-icons/DirectionsWalk'; 
import Hotel from 'material-ui-icons/Hotel'; 

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
      <List>
        <Typography variant="display2">{this.props.user.name}</Typography>
        <ListItem>
          <ListItemIcon>
            <DirectionsWalk />
          </ListItemIcon>
          <ListItemText primary="Steps today" />
          <ListItemSecondaryAction>
            <Typography componentProp="span">
              {this.calculateLastNDays(1)}
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <DirectionsWalk />
          </ListItemIcon>
          <ListItemText primary="Steps this week" />
          <ListItemSecondaryAction>
            <Typography componentProp="span">
              {this.calculateLastNDays(7)}
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
        <ListItem>Sleep last night:</ListItem>
      </List>
    );
  }
};

export default Stat;