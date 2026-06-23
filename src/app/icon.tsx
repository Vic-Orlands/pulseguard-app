import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 6 200 60"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: "50px", width: "180px" }}
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          <linearGradient
            id="shieldGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M8 16 L20 12 L32 16 L32 28 C32 36 20 44 20 44 C20 44 8 36 8 28 Z"
          fill="url(#bgGradient)"
          stroke="url(#shieldGradient)"
          strokeWidth="1.5"
        />
        <path
          d="M12 28 L15 28 L17 22 L19 34 L22 20 L24 32 L26 28 L28 28"
          fill="none"
          stroke="#1d1d1b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>
    </div>,
    size,
  );
}
