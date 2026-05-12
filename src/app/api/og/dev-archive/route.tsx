import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  const title = "Devotional Archive | The Nii Dromo";
  const description =
    "Archive of past daily devotionals ${dateRange}. A collection of spiritual reflections and biblical insights by Nii Dromo.";
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
            backgroundColor: "#6c5b7c",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #c06c84 2%, transparent 0%), radial-gradient(circle at 75px 75px, #c06c84 2%, transparent 0%)",
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
                d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"
                stroke="#93c5fd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{ color: "#93c5fd", fontSize: "20px", fontWeight: "600" }}
            >
              Nii Dromo's Devotionals
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
              color: "#bfdbfe",
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
