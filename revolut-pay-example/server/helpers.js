import crypto from "crypto";

const calculateHmac = (payloadToSign, signingSecret) => {
  return crypto
    .createHmac("sha256", signingSecret)
    .update(payloadToSign)
    .digest("hex");
};

export const parseSignatureHeader = (signatureHeader) => {
  if (typeof signatureHeader !== "string") {
    return [];
  }

  return signatureHeader
    .split(",")
    .map((signatureEntry) => {
      const [version, signature] = signatureEntry.trim().split("=");

      if (!version || !signature) {
        return null;
      }

      return { version, signature };
    })
    .filter(Boolean);
};

const getSigningSecrets = (signingSecrets) => {
  if (typeof signingSecrets !== "string") {
    return [];
  }

  return signingSecrets
    .split(",")
    .map((signingSecret) => signingSecret.trim())
    .filter(Boolean);
};

const timingSafeEqual = (signature, expectedSignature) => {
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");

  if (
    signatureBuffer.length === 0 ||
    signatureBuffer.length !== expectedSignatureBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
};

export const validateSignature = ({
  originalSignature,
  requestTimestamp,
  rawPayload,
  signingSecrets,
}) => {
  const signatures = parseSignatureHeader(originalSignature);
  const secrets = getSigningSecrets(signingSecrets);

  if (signatures.length === 0 || secrets.length === 0) {
    return false;
  }

  return signatures.some(({ version, signature }) =>
    secrets.some((signingSecret) => {
      const payloadToSign = `${version}.${requestTimestamp}.${rawPayload}`;
      const expectedSignature = calculateHmac(payloadToSign, signingSecret);

      return timingSafeEqual(signature, expectedSignature);
    }),
  );
};

// 5 minutes tolerance (milliseconds)
const TOLERANCE_ZONE = 300000;

export const validateTimestamp = (requestTimestamp) => {
  const timestamp = Number(requestTimestamp);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const currentTimestamp = Date.now();
  const difference = currentTimestamp - timestamp;

  return difference >= 0 && difference <= TOLERANCE_ZONE;
};
