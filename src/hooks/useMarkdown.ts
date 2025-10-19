import markdownIt from "markdown-it";
import { useMemo } from "preact/hooks";

const parser = markdownIt("default", { });

export function useMarkdown(options: { stripTitle?: boolean, stripRenderedLink?: boolean }, markdown?: string) {
    if (!markdown) {
        return null;
    }
    return useMemo(() => {
        const html = parser.render(markdown);
        const element = document.createElement("p");
        element.innerHTML = html;
        // Now clear some bits up
        if (options.stripRenderedLink) {
            for (const link of element.querySelectorAll('a')) {
                if (link.textContent === "Rendered") {
                    link.remove();
                }
            }
        }
        if (options.stripTitle) {
            const possibleTitle = element.children[0];
            if (["H1", "H2", "H3"].includes(possibleTitle.tagName)) {
                possibleTitle.remove();
            }
        }
        return element.innerHTML;
    }, [options, markdown]);
}