import crypto from "crypto";

const calculateHmac = (payloadToSign, signingSecret) => {
  return crypto
    .createHmac("sha256", signingSecret)
    .update(payloadToSign)
    .digest("hex");
};

export const validateSignature = ({
  signatureVersion,
  originalSignature,
  payloadToSign,
  signingSecret,
}) => {
  const signature =
    `${signatureVersion}=` + calculateHmac(payloadToSign, signingSecret);

  return originalSignature === signature;
};

// 5 minutes tolerance (milliseconds)
const TOLERANCE_ZONE = 300000;

export const validateTimestamp = (requestTimestamp) => {
  const currentTimestamp = Date.now();
  const difference = currentTimestamp - requestTimestamp;

  return difference >= 0 && difference <= TOLERANCE_ZONE;
};
