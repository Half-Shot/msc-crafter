import { useCallback, useContext, useState } from "preact/hooks";
import { createContext } from "preact";
import type { PropsWithChildren } from "preact/compat";
import type { MSC } from "../model/MSC";
import type { createStarryNight } from "@wooorm/starry-night";
import type { Root } from "hast";

type CurrentState = null | {
  msc: MSC;
  renderTree(): Promise<Root>;
};
export const CurrentMSCContext = createContext<CurrentState>(null);
export const useCurrentMSC = () => useContext(CurrentMSCContext)!;

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

export function CurrentMSCContextProvider({
  msc,
  children,
}: PropsWithChildren<{ msc: MSC }>) {
  const [cachedTree, setTree] = useState<Promise<Root> | null>(null);
  const renderTree = useCallback(() => {
    if (cachedTree) {
      return cachedTree;
    }
    const promise = (async () => {
      if (!msc.body.markdown) {
        throw Error("No body");
      }
      const { common, createStarryNight } = await import(
        "@wooorm/starry-night"
      );
      const sn = await createStarryNight(common);
      // We know that markdown is available.
      const tree = sn.highlight(msc.body.markdown, sn.flagToScope("markdown")!);
      starryNightGutter(tree);
      return tree;
    })();
    promise.catch(() => setTree(null));
    setTree(promise);
    return promise;
  }, [msc]);
  return (
    <CurrentMSCContext.Provider value={{ msc, renderTree }}>
      {children}
    </CurrentMSCContext.Provider>
  );
}
