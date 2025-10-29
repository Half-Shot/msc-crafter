import { type SubmitEventHandler, type InputEventHandler } from "preact";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import styled from "styled-components";
import { useLocalMSCCache } from "../hooks/useLocalMSCCache";
import { useDebouncedCallback, useHash, useHotkeys } from "@mantine/hooks";
import type MiniSearch from "minisearch";
import { searchForMSCs } from "../github";
import { useGitHubAuth } from "../hooks/GitHubAuth";
import { GoSearch } from "react-icons/go";
import { useRecentMSCs } from "../hooks/useRecentMSCs";
import classNames from "classnames";

const SearchButton = styled.button`
  font-size: 0.75em;
  border-radius: var(--mc-border-radius);
  border: 1px solid var(--mc-color-block-border);
  background: var(--mc-color-bg);
  max-width: 500px;
  width: 20em;
  padding: 0.3rem 0 0.3em 0.5em;
  text-align: left;
  color: var(--mc-color-text-secondary);
  cursor: text;
  line-break: anywhere;
`;

const SearchInput = styled.input`
  font-size: 0.9em;
  border-radius: var(--mc-border-radius);
  border: 1px solid var(--mc-color-block-border);
  background: var(--mc-color-bg);
  color: var(--mc-color-text-secondary);
  padding-top: 0;
  margin-top: 0;
  width: 100%;
`;

const SearchContainer = styled.dialog`
  min-width: 800px;
  width: 40vw;
  padding: 0.5em;
  border: 1px solid var(--mc-color-block-border);
  border-radius: var(--mc-border-radius);
  margin-top: 1em;
  @media screen and (max-width: 900px) {
    min-width: 0;
    width: 100%;
  }
`;

const SectionHeader = styled.h2`
  font-size: 0.6em;
  font-weight: 600;
  color: var(--mc-color-text-secondary);
`;

const MSCEntry = styled.a`
  display: block;
  font-size: 0.6em;
  font-weight: 400;
  list-style: none;
  color: var(--mc-color-highlight);
  text-decoration: none;

  &.highlight {
    font-weight: 600;
  }
`;

const InfoText = styled.p`
  display: block;
  font-size: 0.6em;
  font-weight: 400;
  color: var(--mc-color-text-secondary);
`;

interface SearchableMSC {
  id: number;
  title: string;
  author: string;
}

export function MSCSearch() {
  const localMSCs = useLocalMSCCache();
  const auth = useGitHubAuth();
  const [matchingMSCs, setMatchingMSCs] = useState<SearchableMSC[]>([]);
  const [, setHash] = useHash();
  const [minisearch, setMinisearch] = useState<MiniSearch<SearchableMSC>>();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const [recentMSCs] = useRecentMSCs();
  const allMSCs = useLocalMSCCache();
  const yourMSCs = useMemo(() => {
    if (!auth || "viewer" in auth === false) {
      return;
    }
    return allMSCs.filter((m) => m.author.githubUsername === auth.viewer.login);
  }, [auth, allMSCs]);

  useHotkeys(
    [
      [
        "ctrl+K",
        () => {
          if (searchDialog.current?.open) {
            searchDialog.current.close();
          } else {
            searchDialog.current?.showModal();
          }
        },
      ],
    ],
    ["INPUT", "TEXTAREA"],
  );

  const closeModal = useCallback(() => {
    searchDialog.current?.close();
  }, [searchDialog.current]);

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
    // use a map to ensure uniqueness.
    const matchingMSCs: Map<string, SearchableMSC> = new Map(
      minisearch!
        .search(text)
        .map((s) => [
          s.id.toString(),
          { author: s.author, title: s.title, id: s.id },
        ]),
    );
    if (auth && "graphqlWithAuth" in auth) {
      try {
        const found = await searchForMSCs(auth.graphqlWithAuth, text);
        for (const s of found) {
          matchingMSCs.set(s.number.toString(), {
            author: s.author.login,
            title: s.title,
            id: s.number,
          });
        }
      } catch (ex) {
        console.warn("Failed to search GitHub", ex);
      }
    }
    setMatchingMSCs([...matchingMSCs.values()]);
  }, 250);

  const onChangeHandler = useCallback<InputEventHandler<HTMLInputElement>>(
    (ev) => {
      ev.preventDefault();
      if (!minisearch) {
        return;
      }
      const text = (ev.target as HTMLInputElement).value;
      void searchFn(text);
    },
    [minisearch],
  );

  const onSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
    (ev) => {
      ev.preventDefault();
      if (!searchRef.current) {
        return;
      }
      const searchField = searchRef.current.value;
      let parsedMSC: number;
      if (searchField.startsWith("MSC")) {
        parsedMSC = parseInt(searchField.slice(3).trim());
      } else {
        parsedMSC = parseInt(searchField.trim());
      }

      if (parsedMSC && !isNaN(parsedMSC)) {
        setHash(`#msc/${parsedMSC}`);
        closeModal();
      } else if (matchingMSCs[0]) {
        setHash(`#msc/${matchingMSCs[0].id}`);
        closeModal();
      } // otherwise, no matches
    },
    [searchRef.current, matchingMSCs],
  );

  return (
    <>
      <SearchContainer closedBy="any" ref={searchDialog}>
        <form onSubmit={onSubmit}>
          <SearchInput
            type="search"
            placeholder="Search MSCs"
            autoFocus={true}
            onChange={onChangeHandler}
            ref={searchRef}
          ></SearchInput>
          {!auth ||
            ("viewer" in auth === false && (
              <InfoText>Not logged in, only searching local cache.</InfoText>
            ))}
          {!searchRef.current?.value ? (
            <>
              <section>
                <SectionHeader>Recents</SectionHeader>
                {recentMSCs.slice(0, 4).map((m) => (
                  <MSCEntry key={m.hash} href={m.hash} onClick={closeModal}>
                    {m.title}
                  </MSCEntry>
                ))}
              </section>
              {yourMSCs && (
                <section>
                  <SectionHeader>Your MSCs</SectionHeader>
                  {yourMSCs.slice(0, 4).map((m) => (
                    <MSCEntry
                      key={m.prNumber}
                      href={`#msc/${m.prNumber}`}
                      onClick={closeModal}
                    >
                      {m.title}
                    </MSCEntry>
                  ))}
                </section>
              )}
            </>
          ) : (
            <section>
              <SectionHeader>Results</SectionHeader>
              {matchingMSCs.map((m, i) => (
                <MSCEntry
                  className={classNames(i === 0 && "highlight")}
                  key={m.id}
                  href={`#msc/${m.id}`}
                  onClick={closeModal}
                >
                  {m.title}
                </MSCEntry>
              ))}
              {matchingMSCs.length === 0 && (
                <InfoText>No matches found</InfoText>
              )}
            </section>
          )}
        </form>
      </SearchContainer>
      <SearchButton onClick={() => searchDialog.current?.showModal()}>
        <GoSearch /> Search MSCs [Ctrl+K]
      </SearchButton>
    </>
  );
}
