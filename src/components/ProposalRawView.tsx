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
import type { createStarryNight } from "@wooorm/starry-night";

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

/**
 * @param {Root} tree
 *   Tree.
 * @returns {undefined}
 *   Nothing.
 */
function starryNightGutter(
  tree: ReturnType<Awaited<ReturnType<typeof createStarryNight>>["highlight"]>,
) {
  /** @type {Array<RootContent>} */
  const replacement = [];
  const search = /\r?\n|\r/g;
  let index = -1;
  let start = 0;
  let startTextRemainder = "";
  let lineNumber = 0;

  /**
   * @param {Array<ElementContent>} children
   * @param {number} line
   * @returns {Element}
   */
  const createLine = (children: any, line: number) => {
    return {
      type: "element",
      tagName: "code-line",
      properties: { dataLineNumber: line },
      children: [
        {
          type: "element",
          tagName: "line-number",
          properties: { dataLineNumber: line },
          children: [
            {
              type: "text",
              value: line,
            },
          ],
        },
        {
          type: "element",
          tagName: "span",
          children: children,
        },
      ],
    };
  };

  while (++index < tree.children.length) {
    const child = tree.children[index];

    if (child.type === "text") {
      let textStart = 0;
      let match = search.exec(child.value);

      while (match) {
        // Nodes in this line.
        const line = /** @type {Array<ElementContent>} */ tree.children.slice(
          start,
          index,
        );

        // Prepend text from a partial matched earlier text.
        if (startTextRemainder) {
          line.unshift({ type: "text", value: startTextRemainder });
          startTextRemainder = "";
        }

        // Append text from this text.
        if (match.index > textStart) {
          line.push({
            type: "text",
            value: child.value.slice(textStart, match.index),
          });
        }

        // Add a line, and the eol.
        lineNumber += 1;
        replacement.push(createLine(line, lineNumber), {
          type: "text",
          value: match[0],
        });

        start = index + 1;
        textStart = match.index + match[0].length;
        match = search.exec(child.value);
      }

      // If we matched, make sure to not drop the text after the last line ending.
      if (start === index + 1) {
        startTextRemainder = child.value.slice(textStart);
      }
    }
  }

  const line = /** @type {Array<ElementContent>} */ tree.children.slice(start);
  // Prepend text from a partial matched earlier text.
  if (startTextRemainder) {
    line.unshift({ type: "text", value: startTextRemainder });
    startTextRemainder = "";
  }

  if (line.length > 0) {
    lineNumber += 1;
    replacement.push(createLine(line, lineNumber));
  }

  // Replace children with new array.
  tree.children = replacement as any;
}

const ProposalRawView = ({ showThreads }: { showThreads: boolean }) => {
  const { msc } = useCurrentMSC();
  const [renderedCode, setRenderedCode] = useState();

  useEffect(() => {
    (async () => {
      if (!msc.body.markdown) {
        return;
      }
      const { common, createStarryNight } = await import(
        "@wooorm/starry-night"
      );
      const sn = await createStarryNight(common);
      // We know that markdown is available.
      const tree = sn.highlight(msc.body.markdown, sn.flagToScope("markdown")!);
      starryNightGutter(tree);
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
  }, [msc.body.markdown]);

  return <Container>{renderedCode}</Container>;
};

export default ProposalRawView;