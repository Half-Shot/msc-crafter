import { type SubmitEventHandler, type InputEventHandler } from "preact";
import { useCallback, useEffect, useId, useState } from "preact/hooks";
import styled from "styled-components";
import { useLocalMSCCache } from "../hooks/useLocalMSCCache";
import { useDebouncedCallback, useHash } from "@mantine/hooks";
import type MiniSearch from "minisearch";
import { searchForMSCs } from "../github";
import { useGitHubAuth } from "../hooks/GitHubAuth";

const Container = styled.form`
  > input {
    font-size: 0.75em;
    border-radius: 8px;
  }
`;

interface SearchableMSC {
  id: number;
  title: string;
  author: string;
}

export function MSCSearch() {
  const localMSCs = useLocalMSCCache();
  const auth = useGitHubAuth();
  const id = useId();
  const [matchingMSCs, setMatchingMSCs] = useState<SearchableMSC[]>([]);
  const [, setHash] = useHash();
  const [minisearch, setMinisearch] = useState<MiniSearch<SearchableMSC>>();

  useEffect(
    () =>
      void (async () => {
        const ms = await import("minisearch");
        const miniSearch = new ms.default<SearchableMSC>({
          fields: ["title", "author", "id"] satisfies Array<
            keyof SearchableMSC
          >,
          storeFields: ["title", "author", "id"],
        });
        await miniSearch.addAllAsync(
          localMSCs.map<SearchableMSC>((msc) => ({
            title: msc.title,
            author: msc.author.githubUsername,
            id: msc.prNumber,
          })),
        );
        setMinisearch(miniSearch);
      })(),
    [localMSCs],
  );

  const searchFn = useDebouncedCallback(async (text: string) => {
    // minisearch is checked in onChangeHandler
    const matchingMSCs: SearchableMSC[] = minisearch!
      .search(text)
      .map((s) => ({ author: s.author, title: s.title, id: s.number }));
    if (auth && "graphqlWithAuth" in auth) {
      try {
        const found = await searchForMSCs(auth.graphqlWithAuth, text);
        matchingMSCs.push(
          ...found.map((s) => ({
            author: s.author.login,
            title: s.title,
            id: s.number,
          })),
        );
      } catch (ex) {
        console.warn("Failed to search GitHub", ex);
      }
    }
    setMatchingMSCs(matchingMSCs);
  }, 250);

  const onChangeHandler = useCallback<InputEventHandler<HTMLInputElement>>(
    (ev) => {
      ev.preventDefault();
      if (
        ev.inputType === "insertReplacementText" &&
        ev.data &&
        !isNaN(parseInt(ev.data))
      ) {
        // This is someone selecting a msc.
        setHash(`#msc/${ev.data}`);
        (ev.target as HTMLInputElement).value = "";
        return;
      }
      if (!minisearch) {
        return;
      }
      const text = (ev.target as HTMLInputElement).value;
      void searchFn(text);
    },
    [minisearch],
  );

  // XXX: Deeply unreacty
  const onSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>((ev) => {
    ev.preventDefault();
    const search = (ev.target as HTMLFormElement)
      .children[0] as HTMLInputElement;
    const searchField = search.value;
    let parsedMSC: number;
    if (searchField.startsWith("MSC")) {
      parsedMSC = parseInt(searchField.slice(3).trim());
    } else {
      parsedMSC = parseInt(searchField.trim());
      if (isNaN(parsedMSC)) {
        return;
      }
    }

    if (parsedMSC && !isNaN(parsedMSC)) {
      setHash(`#msc/${parsedMSC}`);
      (ev.target as HTMLInputElement).value = "";
    }
  }, []);

  return (
    <Container onSubmit={onSubmit}>
      <input
        disabled={!minisearch}
        type="search"
        onChange={onChangeHandler}
        list={id}
        placeholder={"MSC1234..."}
      />
      <datalist id={id}>
        {matchingMSCs.map((m) => (
          <option value={m.id} label={m.title} />
        ))}
      </datalist>
    </Container>
  );
}
