import styled from "styled-components";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";

import {
  useEffect,
  useState,
  type HTMLAttributes,
  type PropsWithChildren,
} from "preact/compat";
import type { Thread } from "../model/MSC";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
import { ContentBlockWithHeading } from "./atoms/ContentBlock";
import Markdown from "react-markdown";
import { Author } from "./atoms/Author";

const Container = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  font-size: 1em;
  overflow-y: scroll;
  background: var(--mc-color-bg);
`;

const LineNumber = styled.span`
  font-family: var(--mc-font-monospace);
  text-align: right;
  user-select: none;
  margin-left: 0.5em;
  color: var(--mc-color-block-border);
`;

const ThreadContainer = styled(ContentBlockWithHeading)`
  margin-left: 2em !important;
  margin-top: 0;
  width: fit-content;
  > span {
    font-size: 0.8em;
  }
`;

const ThreadComment = styled.div`
  border-radius: 0.5em;
  margin-top: 0.25em;
`;

const ThreadTitle = styled.span`
  display: flex;
  gap: 0.5em;
`;

const ThreadPreview = styled.span`
  font-family: var(--mc-font-monospace);
  background: var(--mc-color-bg);
  padding-left: 0.2em;
  border-radius: 0.5em;
`;

const ThreadCommentContent = styled.div`
  padding-left: 2em;
`;

function CommentThread({ thread }: { thread: Thread }) {
  const preview = thread.comments[0].body.markdown
    .trimStart()
    .split("\n")[0]
    .slice(0, 64);
  const [isOpen, setOpen] = useState(false);

  return (
    <ThreadContainer
      padding={false}
      heading={
        <ThreadTitle>
          <button onClick={() => setOpen((o) => !o)}>
            {isOpen ? "Close" : "Open"}
          </button>
          <span>Thread</span>
          <ThreadPreview>{preview}...</ThreadPreview>
        </ThreadTitle>
      }
    >
      {isOpen &&
        thread.comments.map((c) => (
          <ThreadComment>
            <Author username={c.author.githubUsername}>said</Author>
            <ThreadCommentContent>
              <Markdown>{c.body.markdown}</Markdown>
            </ThreadCommentContent>
          </ThreadComment>
        ))}
    </ThreadContainer>
  );
}

const CodeLineContainer = styled.span`
  font-family: var(--mc-font-monospace);
  display: flex;
  gap: 1.2em;
`;

export function CodeLine({
  children,
  "data-line-number": dln,
  showThreads,
  ...passthrough
}: PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    "data-line-number": number;
    showThreads: boolean;
  }
>) {
  const { msc } = useCurrentMSC();
  const threads = showThreads
    ? msc.threads
        .filter((t) => t.line === dln)
        .map((t) => <CommentThread thread={t} />)
    : null;

  return (
    <div>
      <CodeLineContainer {...passthrough}>{children}</CodeLineContainer>
      {threads}
    </div>
  );
}

const ProposalRawView = ({ showThreads }: { showThreads: boolean }) => {
  const { msc, renderTree } = useCurrentMSC();
  const [renderedCode, setRenderedCode] = useState();

  useEffect(() => {
    (async () => {
      const tree = await renderTree();
      setRenderedCode(
        toJsxRuntime(tree, {
          Fragment,
          jsx,
          jsxs,
          elementAttributeNameCase: "html",
          components: {
            "line-number": LineNumber,
            "code-line": (props) => (
              <CodeLine showThreads={showThreads} {...props} />
            ),
          },
        }),
      );
    })();
  }, [msc.body.markdown, showThreads]);

  return <Container>{renderedCode}</Container>;
};

export default ProposalRawView;
