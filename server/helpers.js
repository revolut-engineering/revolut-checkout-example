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

// 5 minutes tolerance (seconds)
const TOLERANCE_ZONE = 300;

export const validateTimestamp = (requestTimestamp) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const difference = currentTimestamp -  Math.floor(requestTimestamp / 1000);

  return difference >= 0 && difference <= TOLERANCE_ZONE;
};
