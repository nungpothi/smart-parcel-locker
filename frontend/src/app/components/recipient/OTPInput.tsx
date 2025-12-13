type OTPInputProps = {
  length?: number;
};

export const OTPInput = ({ length = 6 }: OTPInputProps) => {
  return <div className="otp-input">OTP Length: {length}</div>;
};

export default OTPInput;
