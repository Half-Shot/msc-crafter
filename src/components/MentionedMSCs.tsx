import { useMemo } from "preact/hooks";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import { useLocalMSCCache } from "../hooks/useLocalMSCCache";
import { MSCLink } from "./MSCLink";
import { ContentBlock } from "./atoms/ContentBlock";

export function MentionedMSCs() {
  const { msc } = useCurrentMSC();
  const localMSCs = useLocalMSCCache();

  const mentioningMSCs = localMSCs.filter((m) =>
    m.mentionedMSCs.includes(msc.prNumber),
  );

  const content = useMemo(() => {
    return [
      ...msc.mentionedMSCs?.map((mscNumber) => (
        <li key={mscNumber}>
          <MSCLink kind="mention" mscNumber={mscNumber} />
        </li>
      )),
      ...mentioningMSCs?.map((msc) => (
        <li key={msc.prNumber}>
          <MSCLink kind="mentioned by" mscNumber={msc.prNumber} />
        </li>
      )),
    ];
  }, [msc.mentionedMSCs, localMSCs]);

  return (
    <ContentBlock>
      <h2>Related MSCs</h2>
      {content.length ? <ul>{content}</ul> : <p>No mentioned MCSs</p>}
    </ContentBlock>
  );
}
