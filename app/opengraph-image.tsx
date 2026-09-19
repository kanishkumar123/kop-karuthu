import { ImageResponse } from "next/og";

export const alt = "Kop Karuthu: the Kop's opinion, in Tamil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "radial-gradient(circle at 80% 10%, #8e0b1f 0%, #150a0c 60%)",
          color: "#eae0cc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 210, fontWeight: 900, color: "#e0102f", lineHeight: 0.8, letterSpacing: -10 }}>KOP</div>
        <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 0.9, letterSpacing: -5 }}>KARUTHU</div>
        <div style={{ marginTop: 28, fontSize: 36, opacity: 0.8 }}>A Tamil Liverpool FC fan podcast. Previews, reviews, live watchalongs.</div>
      </div>
    ),
    size,
  );
}
