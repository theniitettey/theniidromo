import { ImageResponse } from "@vercel/og";
import { allPosts } from "@/lib/content";
import { person } from "@/data/person";

export const runtime = "edge";

const doodlePath =
  "M142.794 12.2109C138.34 12.2109 132.863 7.17136 132.63 6.95835C130.13 4.42221 127.6 2.16653 123.88 2.16653C119.801 2.16653 115.01 6.89057 114.96 6.93763L114.545 7.33186C111.904 9.8402 109.409 12.2107 104.965 12.2107C100.511 12.2107 95.0346 7.17117 94.8017 6.95816C92.3013 4.42202 89.7718 2.16634 86.0512 2.16634C81.9727 2.16634 77.1814 6.89036 77.1313 6.93742L76.7404 7.29663C73.7239 10.042 71.3431 12.2104 67.1383 12.2104C62.6824 12.2104 57.2049 7.17093 56.9744 6.95791C54.4726 4.42178 51.9417 2.1661 48.2239 2.1661C44.1455 2.1661 39.3542 6.89011 39.3041 6.93717L38.8852 7.33508C36.246 9.84221 33.7498 12.209 29.3078 12.209C24.852 12.209 19.3744 7.16944 19.144 6.95643C16.6422 4.42029 14.1113 2.16461 10.3935 2.16461C6.69067 2.16461 3.31656 3.93881 1.58478 6.79543C1.36983 7.1534 0.859483 7.29009 0.447627 7.10142C0.037154 6.91033 -0.11959 6.46768 0.0981496 6.10971C2.12286 2.77304 6.06672 0.697735 10.3923 0.697735C14.8204 0.697735 17.7603 3.30524 20.3924 5.97441C21.8042 7.28421 26.2115 10.7409 29.3066 10.7409C33.0108 10.7409 35.0547 8.79975 37.6437 6.34222L38.0502 5.95642C38.2511 5.75567 43.3865 0.698009 48.2208 0.698009C52.6489 0.698009 55.5888 3.30551 58.2209 5.97469C59.6325 7.28449 64.04 10.7411 67.1351 10.7411C70.6214 10.7411 72.5725 8.96691 75.5238 6.28089L75.8927 5.94468C76.0826 5.75359 81.2179 0.697111 86.0508 0.697111C90.4814 0.697111 93.4217 3.30462 96.051 5.97379C97.4629 7.28118 101.87 10.739 104.965 10.739C108.671 10.739 110.717 8.79669 113.308 6.33541L113.712 5.95323C113.913 5.75248 119.048 0.694824 123.88 0.694824C128.31 0.694824 131.251 3.30233 133.88 5.9715C135.292 7.27889 139.699 10.7367 142.794 10.7367C146.346 10.7367 149.653 9.06772 151.43 6.38173C151.661 6.0298 152.174 5.90765 152.579 6.11203C152.981 6.31402 153.119 6.7627 152.888 7.11343C150.811 10.2603 146.943 12.2112 142.794 12.2112L142.794 12.2109Z";

export async function GET() {
  const activePosts = allPosts.filter((post) => !post.archived);
  const postCount = activePosts.length;

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
            backgroundColor: "#09090b",
            padding: "60px 72px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ color: "#71717a", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              blog
            </span>
            <span style={{ color: "#71717a", fontSize: "14px" }}>
              {postCount} posts
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "52px", fontWeight: "700", color: "#fafafa", lineHeight: 1.15 }}>
              Writing
            </div>
            <div style={{ fontSize: "22px", color: "#a1a1aa", lineHeight: 1.5, maxWidth: "70%" }}>
              Thoughts on TypeScript, software craft, and building for the web.
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <svg width="153" height="13" viewBox="0 0 153 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={doodlePath} fill="#3f3f46" />
            </svg>
            <span style={{ color: "#52525b", fontSize: "16px" }}>{person.siteName}</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error(error);
  }
}
