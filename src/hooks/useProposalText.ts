import { useHash } from "@mantine/hooks";
import markdownIt from "markdown-it";
import { useMemo } from "preact/hooks";
import markdownItHJS from "markdown-it-highlightjs";
import markdownItFootnote from "markdown-it-footnote";
import json from 'highlight.js/lib/languages/json';
import "highlight.js/styles/tokyo-night-dark.min.css";

export const parser = markdownIt("default", { })
  .use(markdownItFootnote)
  .use(markdownItHJS, {
    register: {
        json,
        json5: json,
        jsonl: json,
    }
  } satisfies Parameters<typeof markdownItHJS>[1])

type ProposalHeading = {name: string, subheadings: ProposalHeading[], hash: string}

export function useProposalText(markdown?: string): { html: string, headings: ProposalHeading[]}|null {
    const [hash] = useHash();
    if (!markdown) {
        return null;
    }
    const hashPrefix = hash.slice('#'.length).split('/', 3).slice(0, 2).join('/');
    return useMemo(() => {
        const html = parser.render(markdown);
        const element = document.createElement("p");
        element.innerHTML = html;
        // Remove the title so we don't display it twice.
        const possibleTitle = element.children[0];
        if (["H1", "H2", "H3"].includes(possibleTitle.tagName)) {
            possibleTitle.remove();
        }
        const headings: ProposalHeading[] = [];
        for (const h2header of element.querySelectorAll('h2')) {
            h2header.id = `${hashPrefix}/${h2header.textContent.toLowerCase().replaceAll(/\s/g, '-')}`
            headings.push({
                hash: h2header.id,
                name: h2header.textContent,
                subheadings: [],
            })
        }
        return {html: element.innerHTML, headings};
    }, [hash, markdown]);
}