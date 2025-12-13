type CompartmentInfoProps = {
  label?: string;
};

export const CompartmentInfo = ({ label = "Compartment" }: CompartmentInfoProps) => {
  return <div className="compartment-info">{label}</div>;
};

export default CompartmentInfo;
