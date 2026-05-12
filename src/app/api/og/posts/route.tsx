import { ImageResponse } from "@vercel/og";
import { format } from "date-fns";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title =
      searchParams.get("title") || "The Nii Dromo | Portfolio & Blog";
    const dateStr = searchParams.get("date");
    const date = dateStr ? new Date(dateStr) : new Date();
    const description =
      searchParams.get("description") || "A Post by Nii Dromo";

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
            backgroundColor: "#00204a",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #065f46 2%, transparent 0%), radial-gradient(circle at 75px 75px, #065f46 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            padding: "40px 60px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(217, 250, 255, 0.1)",
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
                d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{ color: "#d9faff", fontSize: "18px", fontWeight: "600" }}
            >
              Blog Post
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
              color: "#d9faff",
              marginBottom: "16px",
            }}
          >
            {format(new Date(date), "MMMM dd, yyyy")}
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "#f2cc96",
              lineHeight: 1.5,
              maxWidth: "80%",
            }}
          >
            {description}
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
