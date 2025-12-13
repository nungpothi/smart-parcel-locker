type LockerStatusBadgeProps = {
  status?: string;
};

export const LockerStatusBadge = ({ status = "Unknown" }: LockerStatusBadgeProps) => {
  return <span className="locker-status-badge">{status}</span>;
};

export default LockerStatusBadge;
