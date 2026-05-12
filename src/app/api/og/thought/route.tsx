import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  const title = "Thoughts | The Nii Dromo";
  const description =
    "A personal blog sharing both technical expertise and life reflections. From software development insights and coding experiences to personal perspectives on life, creativity, and general musings. Join me in exploring technology, personal growth, and everything in between";
  try {
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
            backgroundColor: "#5c2626",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #ea7362 2%, transparent 0%), radial-gradient(circle at 75px 75px, #ea7362 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            padding: "48px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "9999px",
              padding: "8px 24px",
              marginBottom: "32px",
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
                d="M20 14.66V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H9.34"
                stroke="#ddd6fe"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 2L22 6L12 16H8V12L18 2Z"
                stroke="#ddd6fe"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{ color: "#ddd6fe", fontSize: "20px", fontWeight: "600" }}
            >
              Nii Dromo's Thoughts
            </span>
          </div>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "24px",
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#e9d5ff",
              lineHeight: 1.5,
              maxWidth: "90%",
            }}
          >
            {description}
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
