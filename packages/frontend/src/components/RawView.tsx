import styled from "styled-components";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";

import {
  useEffect,
  useState,
  type HTMLAttributes,
  type PropsWithChildren,
} from "preact/compat";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
import { CommentThread } from "./proposalviews/commentThread";
import { useCodeASTImmediate } from "../hooks/useCodeAST";
import type { Root } from "hast";

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

const CodeLineContainer = styled.span`
  font-family: var(--mc-font-monospace);
  display: flex;
  gap: 1.2em;
`;

export function CodeLine({
  children,
  "data-line-number": dln,
  showThreads,
  onlyOpenThreads,
  ...passthrough
}: PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    "data-line-number": number;
    showThreads: boolean;
    onlyOpenThreads: boolean;
  }
>) {
  const { msc } = useCurrentMSC();
  const threads = showThreads
    ? msc.threads
        .filter((t) => !t.outdated)
        .filter((t) => t.line === dln && (!onlyOpenThreads || !t.resolved))
        // TODO: Not a safe key
        .map((t) => (
          <CommentThread key={t.comments[0].created.toISOString()} thread={t} />
        ))
    : null;

  return (
    <div>
      <CodeLineContainer {...passthrough}>{children}</CodeLineContainer>
      {threads}
    </div>
  );
}

export const RawViewWithBody = ({ body }: { body: string }) => {
  const tree = useCodeASTImmediate(body);
  return <RawView tree={tree} showThreads={false} onlyOpenThreads={false} />;
};

export const RawView = ({
  tree,
  showThreads,
  onlyOpenThreads,
}: {
  tree: Root | null;
  showThreads: boolean;
  onlyOpenThreads: boolean;
}) => {
  const [renderedCode, setRenderedCode] = useState();

  useEffect(() => {
    if (!tree) {
      return;
    }
    setRenderedCode(
      toJsxRuntime(tree, {
        Fragment,
        jsx,
        jsxs,
        elementAttributeNameCase: "html",
        components: {
          "line-number": LineNumber,
          "code-line": (props) => (
            <CodeLine
              showThreads={showThreads}
              onlyOpenThreads={onlyOpenThreads}
              {...props}
            />
          ),
        },
      }),
    );
  }, [tree]);

  return <Container>{renderedCode}</Container>;
};

export default RawView;
