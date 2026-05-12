import Image from "next/image";
import Link from "next/link";
import { getMDXComponent } from "next-contentlayer/hooks";
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

const MDXComponent: React.FC<MDXComponentProps> = ({ code }) => {
  const Component = getMDXComponent(code);
  return <Component components={components} />;
};

export default MDXComponent;
