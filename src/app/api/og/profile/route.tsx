import { ImageResponse } from "@vercel/og";
import { person } from "@/data/person";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";

const chips = ["TypeScript", "React", "Next.js", "Go", "Python", "Node.js", "PostgreSQL", "Rust", "Docker", "AWS", "GraphQL", "MongoDB", "Java", "C", "C#", "C++"];

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
            padding: "48px",
            overflow: "hidden",
          }}
        >
          {/* Main row */}
          <div style={{ display: "flex", flex: 1, flexDirection: "row", alignItems: "center" }}>

            {/* Left: individual text items, no bg, sitting on the grid */}
            <div style={{ display: "flex", flexDirection: "column", width: "50%", paddingLeft: "8px", gap: "6px" }}>
              <div style={{ display: "flex", backgroundColor: "#161616", padding: "4px 8px", width: "auto" }}>
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#ffffff",
                    letterSpacing: "-1px",
                    lineHeight: 1,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {person.name}
                </span>
              </div>
                <div style={{ display: "flex", backgroundColor: "#161616", padding: "4px 8px", width: "auto", marginBottom: "16px" }}>
                <span style={{ fontSize: "22px", color: "#d4d4d4" }}>
                  Software Engineer, Ghana.
                </span>
              </div>
              <div style={{ display: "flex", backgroundColor: "#161616", padding: "4px 8px", maxWidth: "480px" }}>
                <span style={{ fontSize: "17px", color: "#737373", lineHeight: 1.6 }}>
                  Developer from Accra, Ghana — building polished, production-grade software for the web. Shipped APIs, high-concurrency systems, and frontend products used by thousands across QuiverTech, BetaForge Labs, and personal projects. CS student at University of Ghana.
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                {chips.map((chip) => (
                  <div
                    key={chip}
                    style={{
                      fontSize: "15px",
                      color: "#737373",
                      border: "1px solid #2a2a2a",
                      padding: "6px 16px",
                      borderRadius: "4px",
                      backgroundColor: "#161616",
                    }}
                  >
                    {chip}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: memoji half clipped */}
            <div
              style={{
                width: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <img
                src={`${baseUrl}/apple-icon.png`}
                width={1240}
                height={1240}
                style={{
                  borderRadius: "620px",
                  marginRight: "-660px",
                }}
              />
            </div>
          </div>

          {/* Site name bottom left */}
          <div style={{ display: "flex", alignSelf: "flex-start", backgroundColor: "#161616", padding: "4px 8px" }}>
            <span style={{ color: "#3a3a3a", fontSize: "14px", letterSpacing: "0.06em" }}>
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
