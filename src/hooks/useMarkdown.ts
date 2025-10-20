import markdownIt from "markdown-it";
import { useMemo } from "preact/hooks";

const parser = markdownIt("default", { });

export function markdownReplacer(markdown: string): string {
    markdown = markdown.replaceAll(/(https:\/\/github.com\/)?matrix-org\/matrix-spec-proposals\/pull\/(\d+)(?=\s)/g, (_subs, _github, prNumber) => {
        return `[MSC${prNumber}](#msc/${prNumber})`;
    })
    return markdown;
}

export function useMarkdown(options: { stripTitle?: boolean, stripRenderedLink?: boolean }, markdown?: string) {
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
        if (options.stripRenderedLink) {
            for (const link of element.querySelectorAll('a')) {
                const parent = link.parentNode;
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
        if (!element.innerHTML.trim()) {
            return;
        }
        return element.innerHTML;
    }, [options, markdown]);
}