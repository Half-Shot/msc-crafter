import "highlight.js/styles/tokyo-night-dark.min.css";
import { useMarkdown } from "./useMarkdown";

type ProposalHeading = {
  name: string;
  subheadings: ProposalHeading[];
  hash: string;
};

export function useProposalText(
  threads: { line: number }[],
  markdown?: string,
): { html: string; headings: ProposalHeading[] } | null {
  const hash = window.location.hash;
  if (!markdown) {
    return null;
  }
  const hashPrefix = hash.slice("#".length).split("/", 3).slice(0, 2).join("/");
  let headings: ProposalHeading[] = [];

  const lines = markdown.split("\n");
  for (let tId = 0; tId < threads.length; tId++) {
    const thread = threads[tId];
    lines[thread.line - 1] =
      `[anchor-${tId}](thread-start:${tId})` +
      lines[thread.line - 1] +
      `[anchor-${tId}](thread-end:${tId})`;
  }

  const html = useMarkdown(
    {
      postprocessor: (element) => {
        headings = [];
        // Remove the title so we don't display it twice.
        const possibleTitle = element.children[0];
        if (["H1", "H2", "H3"].includes(possibleTitle.tagName)) {
          possibleTitle.remove();
        }
        for (const h2header of element.querySelectorAll("h2")) {
          h2header.id = `${hashPrefix}/${h2header.textContent.toLowerCase().replaceAll(/\s/g, "-")}`;
          headings.push({
            hash: h2header.id,
            name: h2header.textContent,
            subheadings: [],
          });
        }
      },
    },
    lines.join("\n"),
  );
  return html ? { html, headings } : null;
}
