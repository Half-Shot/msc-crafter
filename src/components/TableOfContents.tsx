import type { Ref, RefObject } from "preact";
import { useEffect, useState } from "preact/hooks";

export function TableOfContents({
  element,
}: {
  element: RefObject<HTMLElement>;
}) {
  const [headings, setHeadings] = useState<{ hash: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    const h1Headers = [...(element.current?.querySelectorAll("h1") ?? [])];
    const h2Headers = [...(element.current?.querySelectorAll("h2") ?? [])];
    const h3Headers = [...(element.current?.querySelectorAll("h3") ?? [])];
    console.log(h1Headers);
    console.log(h2Headers);
    console.log(h3Headers);
    setHeadings(
      [...h1Headers, ...h2Headers, ...h3Headers].map((e) => ({
        name: e.innerText,
        hash: e.id,
      })),
    );
  }, []);

  return (
    <>
      <h2>Table of contents</h2>
      <ul>
        {headings.map((heading) => (
          <li key={heading.hash}>
            <a href={"#" + heading.hash}>{heading.name}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
