import { ReactNode } from "react";

type StepperProps = {
  steps?: ReactNode[];
};

export const Stepper = ({ steps = [] }: StepperProps) => {
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div key={index} className="step">
          {step ?? `Step ${index + 1}`}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
