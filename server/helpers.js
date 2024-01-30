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
