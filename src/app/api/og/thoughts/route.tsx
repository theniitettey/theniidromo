import { ImageResponse } from "@vercel/og";
import { format } from "date-fns";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title =
      searchParams.get("title") || "The Nii Dromo | Portfolio & Blog";
    const date = searchParams.get("date") || new Date();

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            backgroundColor: "#432c51",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #54a4af 2%, transparent 0%), radial-gradient(circle at 75px 75px, #54a4af 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            padding: "40px 60px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderRadius: "9999px",
              padding: "8px 24px",
              marginBottom: "24px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: "12px" }}
            >
              <path
                d="M20 12V4H4V20H12"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 18C18 19.1046 18.8954 20 20 20C21.1046 20 22 19.1046 22 18C22 16.8954 21.1046 16 20 16C18.8954 16 18 16.8954 18 18Z"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{ color: "#60a5fa", fontSize: "18px", fontWeight: "600" }}
            >
              Thoughts
            </span>
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "16px",
              lineHeight: 1.2,
              maxWidth: "80%",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
            }}
          >
            {format(new Date(date), "MMMM dd, yyyy")}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 627,
      }
    );
  } catch (error) {
    console.error(error);
  }
}
