import React from 'react';

const Stat = (props) => {
  return (
    <div>
      <span>{ props.user.name }: { props.items.reduce((sum, item) => sum + item.value, 0) } steps</span>
    </div>
  )
};
Stat.displayName = 'Stat';
export default Stat;