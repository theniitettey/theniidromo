import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const computedFields = {
  slug: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
  },
  readTimeMinutes: {
    type: "string",
    resolve: (doc) => {
      const wordsPerMinute = 200;
      const noOfWords = doc.body.raw.split(/\s/g).length;
      const minutes = noOfWords / wordsPerMinute;
      const readTime = Math.ceil(minutes);
      return `${readTime} min read`;
    },
  },
};

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `pages/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: false,
    },
  },
  computedFields,
}));

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `posts/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: false,
    },
    date: {
      type: "date",
      required: true,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      required: false,
    },
    draft: {
      type: "boolean",
      required: false,
      default: false,
    },
    archived: {
      type: "boolean",
      required: false,
      default: false,
    },
  },
  computedFields,
}));

export const Asore = defineDocumentType(() => ({
  name: "Asore",
  filePathPattern: `asore/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: false,
    },
    date: {
      type: "date",
      required: true,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      required: false,
    },
    draft: {
      type: "boolean",
      required: false,
      default: false,
    },
    archived: {
      type: "boolean",
      required: false,
      default: false,
    },
    christian: {
      type: "boolean",
      required: false,
      default: false,
    },
  },
  computedFields,
}));

export const Thoughts = defineDocumentType(() => ({
  name: "Thoughts",
  filePathPattern: `thoughts/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    date: {
      type: "date",
      required: true,
    },
    description: {
      type: "string",
      required: false,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      required: false,
    },
    draft: {
      type: "boolean",
      required: false,
      default: false,
    },
    archived: {
      type: "boolean",
      required: false,
      default: false,
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Post, Page, Thoughts, Asore],
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
