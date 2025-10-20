import { type GenericEventHandler, type InputEventHandler } from "preact";
import { useCallback, useId, useState } from "preact/hooks";
import styled from "styled-components";
import { useLocalMSCCache } from "../hooks/useLocalMSCCache";
import type { MSC } from "../model/MSC";
import type { ChangeEventHandler } from "preact/compat";
import { useHash } from "@mantine/hooks";

const Container = styled.span`
    > input {
     font-size: 0.75em;
     border-radius: 8px;
    }
`

export function MSCSearch() {
    const localMSCs = useLocalMSCCache();
    const id = useId();
    const [matchingMSCs, setMatchingMSCs] = useState<MSC[]>([]);
    const [, setHash] = useHash();

    const onChangeHandler = useCallback<InputEventHandler<HTMLInputElement>>((ev) => {
        if (ev.inputType === "insertReplacementText" && ev.data && !isNaN(parseInt(ev.data))) {
            // This is someone selecting a msc.
            setHash(`#msc/${ev.data}`);
            (ev.target as HTMLInputElement).value = "";
            return;
        }
        ev.preventDefault();
        const text = (ev.target as HTMLInputElement).value;
        const words = text.split(/\b/).filter(t => !!t.trim());
        const likelyMSCs = words.filter(v => v.toUpperCase().startsWith('MSC') || !isNaN(parseInt(v))).map(r => r.toUpperCase().replace('MSC', ''));
        const matchingMSCs = likelyMSCs.length ? localMSCs.filter(v => likelyMSCs.some(prefix => v.prNumber.toString().startsWith(prefix))): [];
        setMatchingMSCs(matchingMSCs);
    }, [localMSCs]);

    return <Container>
        <input type="search" onChange={onChangeHandler} list={id} placeholder={"MSC1234..."} />
        <datalist id={id}>
            {matchingMSCs.map(m => <option onClick={() => console.log("boop", m.prNumber)} value={m.prNumber} label={m.title} />)}
        </datalist>
    </Container>
}