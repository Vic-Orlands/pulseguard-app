import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #2563eb, #9333ea)",
          opacity: 0.8,
          borderRadius: "30%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "50%",
            height: "50%",
            backgroundColor: "white",
            borderRadius: "50%",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
