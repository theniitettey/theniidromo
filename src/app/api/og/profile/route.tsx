import { ImageResponse } from "@vercel/og";
import { person } from "@/data/person";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";

export async function GET() {
  const baseUrl = siteConfig.url;

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#161616",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            padding: "72px 90px",
          }}
        >
          {/* Top: avatar */}
          <div style={{ display: "flex" }}>
            <img
              src={`${baseUrl}/apple-icon.png`}
              width={100}
              height={100}
              style={{ borderRadius: "50px" }}
            />
          </div>

          {/* Middle: name + info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                fontSize: "72px",
                fontWeight: "800",
                color: "#ffffff",
                letterSpacing: "-2px",
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              {person.shortName}
            </div>
            <div style={{ fontSize: "24px", color: "#d4d4d4", letterSpacing: "-0.3px" }}>
              Software Engineer, Ghana.
            </div>
            <div style={{ fontSize: "21px", color: "#737373" }}>
              Building polished experiences at BetaForge Labs.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
              <div
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "5px",
                  backgroundColor: "#525252",
                }}
              />
              <span style={{ color: "#737373", fontSize: "19px" }}>
                TypeScript · CS Student, UG
              </span>
            </div>
          </div>

          {/* Bottom: site name */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span style={{ color: "#404040", fontSize: "16px", letterSpacing: "0.05em" }}>
              {person.siteName.toLowerCase()}
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error(error);
  }
}
