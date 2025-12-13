type PickupStatusProps = {
  status?: string;
};

export const PickupStatus = ({ status = "Awaiting" }: PickupStatusProps) => {
  return <div className="pickup-status">{status}</div>;
};

export default PickupStatus;
