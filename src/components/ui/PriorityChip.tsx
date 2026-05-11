import React from 'react';
import type { TicketPriority } from '../../types';
import { PRIORITY_LABEL } from '../../types';

interface Props {
  priority: TicketPriority;
  showLabel?: boolean;
}

const PriorityChip: React.FC<Props> = ({ priority, showLabel = true }) => (
  <span className={`prio p-${priority}`}>
    <span className="bar">
      <i /><i /><i /><i />
    </span>
    {showLabel && PRIORITY_LABEL[priority]}
  </span>
);

export default PriorityChip;
