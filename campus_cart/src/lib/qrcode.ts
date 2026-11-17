import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates a PNG data URL of a QR code pointing to the provided URL.
 */
export async function generateQRCodeDataURL(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 320,
    margin = 2,
    color = { dark: "#0f172a", light: "#ffffff" },
  } = options;

  return QRCode.toDataURL(text, {
    width,
    margin,
    color,
    errorCorrectionLevel: "M",
  });
}
