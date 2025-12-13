type OverviewCardProps = {
  title?: string;
  value?: string | number;
};

export const OverviewCard = ({ title = "Title", value = "-" }: OverviewCardProps) => {
  return (
    <div className="overview-card">
      <div className="overview-card__title">{title}</div>
      <div className="overview-card__value">{value}</div>
    </div>
  );
};

export default OverviewCard;
