import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#059669",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fafaf9",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#059669",
              top: 4,
              left: 8,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#059669",
              top: 9,
              left: 4,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#059669",
              top: 9,
              left: 13,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#059669",
              top: 14,
              left: 8,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
