import type { ComponentProps } from "preact";
import styled from "styled-components";
import { default as ReactMarkdown } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const Container = styled.div`
  blockquote {
    color: var(--mc-color-text-secondary);
    margin: 0;
    padding-left: 1em;
    border-left: 1px solid var(--mc-color-text-secondary);
  }
`;

export default function Markdown(
  props: ComponentProps<typeof ReactMarkdown>,
): ReturnType<typeof ReactMarkdown> {
  return (
    <Container>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        {...props}
      ></ReactMarkdown>
    </Container>
  );
}
