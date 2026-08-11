import { ImageResponse } from "next/og";

export const alt = "Loja de Camisas";
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
          justifyContent: "center",
          background: "#0B0E0C",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 90,
            height: 10,
            background: "#FF4D2E",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 108,
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: -2,
            color: "#F5F3EE",
            textTransform: "uppercase",
          }}
        >
          <span>Vista a</span>
          <span>camisa.</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 32,
            color: "#8B9088",
          }}
        >
          Torcedor, retrô, player ou treino — direto pro seu guarda-roupa.
        </div>
      </div>
    ),
    { ...size },
  );
}
