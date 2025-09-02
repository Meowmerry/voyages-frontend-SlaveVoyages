import { ContributionStatus } from '@dotproductdev/voyages-contribute';
import { Tag } from 'antd';

const statusConfig: Record<
  ContributionStatus,
  { label: string; color: string }
> = {
  [ContributionStatus.WorkInProgress]: {
    label: 'Work In Progress',
    color: 'orange',
  },
  [ContributionStatus.Submitted]: {
    label: 'Submitted',
    color: 'blue',
  },
  [ContributionStatus.Accepted]: {
    label: 'Accepted',
    color: 'green',
  },
  [ContributionStatus.Rejected]: {
    label: 'Rejected',
    color: 'red',
  },
  [ContributionStatus.Published]: {
    label: 'Published',
    color: 'purple',
  },
};

// Status Cell Renderer for AG-Grid
const StatusCellRenderer = ({ value }: { value?: ContributionStatus }) => {
  const statusKey =
    value! in statusConfig
      ? (value as ContributionStatus)
      : ContributionStatus.Submitted;
  const config = statusConfig[statusKey];

  return (
    <Tag color={config.color} style={{ margin: 0 }}>
      {config.label}
    </Tag>
  );
};

export default StatusCellRenderer;
