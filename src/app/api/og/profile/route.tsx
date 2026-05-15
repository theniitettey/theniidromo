import { ImageResponse } from "@vercel/og";
import { person } from "@/data/person";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";

export async function GET() {
  const baseUrl = siteConfig.url;

  try {
    return new ImageResponse(
      (
        // Outer: full canvas with grid bg
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            backgroundColor: "#161616",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        >
          {/* Inner card: plain bg, no grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "#161616",
              height: "100%",
              width: "580px",
              padding: "64px 72px",
            }}
          >
            {/* Avatar */}
            <img
              src={`${baseUrl}/apple-icon.png`}
              width={160}
              height={160}
              style={{ borderRadius: "80px" }}
            />

            {/* Name + info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  fontSize: "64px",
                  fontWeight: "800",
                  color: "#ffffff",
                  letterSpacing: "-2px",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                {person.shortName}
              </div>
              <div style={{ fontSize: "22px", color: "#d4d4d4", letterSpacing: "-0.3px" }}>
                Software Engineer, Ghana.
              </div>
              <div style={{ fontSize: "19px", color: "#737373" }}>
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
                <span style={{ color: "#737373", fontSize: "17px" }}>
                  TypeScript · CS Student, UG
                </span>
              </div>
            </div>

            {/* Site name */}
            <span style={{ color: "#404040", fontSize: "15px", letterSpacing: "0.05em" }}>
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
