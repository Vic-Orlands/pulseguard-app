import { ImageResponse } from "next/og";

export const alt =
  "An intelligent, error tracking and monitoring tool for your web apps";
export const size = {
  width: 800,
  height: 418,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #2563eb, #9333ea)",
          color: "white",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            marginBottom: "40px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              background: "linear-gradient(to bottom right, #2563eb, #9333ea)",
              opacity: 0.8,
              borderRadius: "50%",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "40%",
                height: "40%",
                backgroundColor: "white",
                borderRadius: "50%",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </div>
        <h1 style={{ fontSize: 48, marginBottom: 20 }}>PulseGuard</h1>
        <p style={{ fontSize: 24, opacity: 0.8 }}>
          An intelligent, error tracking and monitoring tool for your web apps
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
