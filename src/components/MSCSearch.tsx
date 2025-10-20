import { type SubmitEventHandler, type InputEventHandler } from "preact";
import { useCallback, useId, useMemo, useState } from "preact/hooks";
import styled from "styled-components";
import { useLocalMSCCache } from "../hooks/useLocalMSCCache";
import type { MSC } from "../model/MSC";
import { useHash } from "@mantine/hooks";
import MiniSearch from "minisearch";

const Container = styled.form`
    > input {
     font-size: 0.75em;
     border-radius: 8px;
     
    }
`

interface SearchableMSC {
    id: number;
    title: string;
    author: string;
}

export function MSCSearch() {
    const localMSCs = useLocalMSCCache();
    const id = useId();
    const [matchingMSCs, setMatchingMSCs] = useState<MSC[]>([]);
    const [, setHash] = useHash();

    const miniseach = useMemo(() => {
        const miniSearch = new MiniSearch<SearchableMSC>({
            fields: ['title', 'author', 'id'] satisfies Array<keyof SearchableMSC>,
            storeFields: [],
        });
        // TODO: Use async method
        miniSearch.addAll(localMSCs.map<SearchableMSC>((msc) => ({title: msc.title, author: msc.author.githubUsername, id: msc.prNumber})));
        return miniSearch;
    }, [localMSCs]);

    const onChangeHandler = useCallback<InputEventHandler<HTMLInputElement>>((ev) => {
        if (ev.inputType === "insertReplacementText" && ev.data && !isNaN(parseInt(ev.data))) {
            // This is someone selecting a msc.
            setHash(`#msc/${ev.data}`);
            (ev.target as HTMLInputElement).value = "";
            return;
        }
        ev.preventDefault();
        const text = (ev.target as HTMLInputElement).value;
        const matchingMSCs = miniseach.search(text).map(result => localMSCs.find(m => m.prNumber === result.id)!);
        setMatchingMSCs(matchingMSCs);
    }, [miniseach]);

    // XXX: Deeply unreacty
    const onSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(ev => {
        ev.preventDefault();
        const search = ((ev.target as HTMLFormElement).children[0] as HTMLInputElement);
        const searchField = search.value;
        let parsedMSC: number;
        if (searchField.startsWith('MSC')) {
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

    return <Container onSubmit={onSubmit}>
        <input type="search" onChange={onChangeHandler} list={id} placeholder={"MSC1234..."} />
        <datalist id={id}>
            {matchingMSCs.map(m => <option onClick={() => console.log("boop", m.prNumber)} value={m.prNumber} label={m.title} />)}
        </datalist>
    </Container>
}