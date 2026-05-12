import { defineConfig, defineCollection, s } from "velite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const mdxOptions = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
};

const computed = (path: string, rawBody: string) => ({
  slug: `/${path}`,
  slugAsParams: path.split("/").slice(1).join("/"),
  readTimeMinutes: `${Math.ceil(rawBody.split(/\s/g).length / 200)} min read`,
});

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string().optional(),
      date: s.isodate(),
      tags: s.array(s.string()).optional(),
      draft: s.boolean().default(false),
      archived: s.boolean().default(false),
      body: s.mdx(mdxOptions),
      rawBody: s.raw(),
      path: s.path(),
    })
    .transform((data) => ({
      ...data,
      ...computed(data.path, data.rawBody),
    })),
});

const thoughts = defineCollection({
  name: "Thought",
  pattern: "thoughts/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      date: s.isodate(),
      description: s.string().optional(),
      tags: s.array(s.string()).optional(),
      draft: s.boolean().default(false),
      archived: s.boolean().default(false),
      body: s.mdx(mdxOptions),
      rawBody: s.raw(),
      path: s.path(),
    })
    .transform((data) => ({
      ...data,
      ...computed(data.path, data.rawBody),
    })),
});

const asores = defineCollection({
  name: "Asore",
  pattern: "asore/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string().optional(),
      date: s.isodate(),
      tags: s.array(s.string()).optional(),
      draft: s.boolean().default(false),
      archived: s.boolean().default(false),
      christian: s.boolean().default(false),
      body: s.mdx(mdxOptions),
      rawBody: s.raw(),
      path: s.path(),
    })
    .transform((data) => ({
      ...data,
      ...computed(data.path, data.rawBody),
    })),
});

const pages = defineCollection({
  name: "Page",
  pattern: "pages/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string().optional(),
      body: s.mdx(mdxOptions),
      rawBody: s.raw(),
      path: s.path(),
    })
    .transform((data) => ({
      ...data,
      ...computed(data.path, data.rawBody),
    })),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts, thoughts, asores, pages },
});
