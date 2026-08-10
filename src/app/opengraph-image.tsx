import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const logoData = readFileSync(
    join(process.cwd(), "public/logos/yo-voice-symbol.png"),
  ).toString("base64");
  const logoSrc = `data:image/png;base64,${logoData}`;

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
          backgroundColor: "#060511",
          backgroundImage:
            "radial-gradient(circle at 76% 36%, rgba(192,38,255,0.35) 0%, transparent 45%), radial-gradient(circle at 18% 28%, rgba(88,28,135,0.28) 0%, transparent 50%)",
        }}
      >
        {/* No borderRadius any more: that existed to round off the black
            square baked into the previous asset. The supplied symbol is
            transparent, so it sits straight on the card gradient. Height is
            the mark's true 362:375 ratio so it isn't squashed. */}
        <img src={logoSrc} alt="" width={140} height={145} />
        <div
          style={{
            marginTop: 40,
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            letterSpacing: -2,
            display: "flex",
          }}
        >
          YO Voice
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 32,
            color: "#e9b8ff",
            display: "flex",
          }}
        >
          Your voice. Your community.
        </div>
      </div>
    ),
    { ...size },
  );
}
