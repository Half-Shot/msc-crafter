import { useMemo } from "preact/hooks";
import markdownItHJS from "markdown-it-highlightjs";
import markdownItFootnote from "markdown-it-footnote";
import json from 'highlight.js/lib/languages/json';
import markdownIt from "markdown-it";

const MSPUrlRegex = /(https:\/\/github.com\/)?matrix-org\/matrix-spec-proposals\/pull\/(\d+)(?=\s|$)/;

export function markdownReplacer(markdown: string): string {
    markdown = markdown.replaceAll(new RegExp(MSPUrlRegex, 'g'), (_subs, _github, prNumber) => {
        return `[MSC${prNumber}](#msc/${prNumber})`;
    })
    return markdown;
}

export const parser = markdownIt("default", { })
  .use(markdownItFootnote)
  .use(markdownItHJS, {
    register: {
        json,
        json5: json,
        jsonl: json,
    }
  } satisfies Parameters<typeof markdownItHJS>[1])

export function useMarkdown(options: { stripTitle?: boolean, stripRenderedLink?: boolean, postprocessor?: (element: HTMLParagraphElement) => void }, markdown?: string) {
    return useMemo(() => {
        if (!markdown || !markdown.trim()) {
            return;
        }
        // Preprocessing stage
        markdown = markdownReplacer(markdown);
        const html = parser.render(markdown);
        // Postprocessing stage
        const element = document.createElement("p");
        element.innerHTML = html;
        for (const link of element.querySelectorAll('a')) {
            const parent = link.parentNode;
            link.href = link.href.replace(MSPUrlRegex,(_subs, _github, prNumber) => `#msc/${prNumber}`);
            if (options.stripRenderedLink) {
                if (link.textContent === "Rendered") {
                    link.remove();
                }
                if (parent && parent.children.length === 0) {
                    parent.parentNode?.removeChild(parent);
                }
            }
        }
        if (options.stripTitle) {
            const possibleTitle = element.children[0];
            if (["H1", "H2", "H3"].includes(possibleTitle.tagName)) {
                possibleTitle.remove();
            }
        }
        options.postprocessor?.(element);
        if (!element.innerHTML.trim()) {
            return;
        }
        return element.innerHTML;
    }, [options, markdown]);
}