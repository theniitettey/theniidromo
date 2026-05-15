import { ImageResponse } from "@vercel/og";
import { person } from "@/data/person";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f172a",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)",
            backgroundSize: "100px 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: "rgba(30, 41, 59, 0.7)",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "90%",
              width: "90%",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  marginBottom: "24px",
                }}
              >
                <img
                  src={person.social.avatarUrl}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "60px",
                    border: "4px solid #3b82f6",
                    marginRight: "24px",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "bold",
                      color: "#ffffff",
                      marginBottom: "8px",
                    }}
                  >
                    {person.name}
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      color: "#94a3b8",
                      marginBottom: "8px",
                    }}
                  >
                    Software Engineering, AI/ML & CPH
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: "21px",
                  color: "#cbd5e1",
                  marginBottom: "24px",
                  textAlign: "left",
                  maxWidth: "700px",
                  lineHeight: "1.5",
                }}
              >
                Expert in full-stack web development, delivering cutting-edge
                applications and digital solutions. Specializing in React,
                Node.js, and cloud technologies.
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  justifyContent: "flex-start",
                  maxWidth: "700px",
                }}
              >
                {[
                  "React",
                  "Node.js",
                  "TypeScript",
                  "JavaScript",
                  "Next.js",
                  "Express.js",
                  "Nest.js",
                  "MongoDB",
                  "PostgreSQL",
                  "AWS",
                  "Google Cloud",
                  "Azure",
                  "REST API",
                  "GraphQL",
                  "Firebase",
                ].map((skill) => (
                  <div
                    key={skill}
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      color: "#60a5fa",
                      padding: "8px 16px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "500",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12H22"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div style={{ color: "#ffffd3", fontSize: "16px" }}>
                  https://okponglozuck.bflabs.tech
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                width="300"
                height="354"
                viewBox="0 0 29 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                opacity="0.4"
              >
                <rect width="3.5" height="12.5" fill="#EC7C4C" />
                <path
                  d="M9 0H12.5V29.5H16.5V23L14.5 21.5V19.5V14.75L20 18.75V29.5V33H16.5H9V0Z"
                  fill="#67C571"
                />
                <rect x="25.5" width="3.5" height="12.5" fill="#F4C725" />
                <path d="M16.5 0H20V15.3828L16.5 12.8409V0Z" fill="#4B4438" />
              </svg>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error(error);
  }
}
