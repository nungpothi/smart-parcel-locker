type ParcelStatusCardProps = {
  status?: string;
};

export const ParcelStatusCard = ({ status = "Pending" }: ParcelStatusCardProps) => {
  return <div className="parcel-status-card">{status}</div>;
};

export default ParcelStatusCard;
