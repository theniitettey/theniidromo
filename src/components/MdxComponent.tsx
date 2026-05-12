import Image from "next/image";
import Link from "next/link";
import * as runtime from "react/jsx-runtime";
import { Code } from "bright";
import { mdxComponents } from "./mdx-components";

Code.theme = {
  dark: "github-dark",
  light: "github-light",
  darkSelector: ".dark",
};

const components = {
  ...mdxComponents,
  Image,
  Link,
  pre: Code,
};

interface MDXComponentProps {
  code: string;
}

function getMDXComponent(code: string) {
  const fn = new Function(code);
  return fn({ ...runtime }).default as React.ComponentType<{ components?: Record<string, unknown> }>;
}

const MDXComponent: React.FC<MDXComponentProps> = ({ code }) => {
  const Component = getMDXComponent(code);
  return <Component components={components as Record<string, unknown>} />;
};

export default MDXComponent;
