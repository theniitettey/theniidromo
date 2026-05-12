import { ImageResponse } from "@vercel/og";
import { allPosts } from "@/lib/content";

export const runtime = "edge";

export async function GET() {
  const activePosts = allPosts.filter((post) => !post.archived);
  const postCount = activePosts.length;

  let latestPostDate = "";
  if (postCount > 0) {
    const dates = activePosts.map((post) => new Date(post.date));
    const mostRecent = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    );
    latestPostDate = mostRecent.toISOString();
  }

  const topics = [...new Set(activePosts.flatMap((post) => post.tags || []))];
  const topTopics = topics.slice(0, 5).join(", ");

  const title = "Blog | The Nii Dromo";
  const description =
    postCount > 0
      ? `Explore ${postCount} articles on ${
          topTopics || "various topics"
        }. Personal insights, technical writings, and thoughts by Nii Dromo.`
      : "Personal blog featuring insights, technical writings, and thoughts by Nii Dromo.";
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
            backgroundColor: "#36162e",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #b14b4b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #b14b4b 2%, transparent 0%)",
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
                d="M19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20Z"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 2V6"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 2V6"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 10H21"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{ color: "#e5e7eb", fontSize: "20px", fontWeight: "600" }}
            >
              Nii Dromo's Blog Posts
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
              color: "#d1d5db",
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
