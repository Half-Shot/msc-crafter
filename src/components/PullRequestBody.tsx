import styled from "styled-components";
import { MSCState, type MSC } from "../model/MSC";
import { ContentBlock } from "./atoms/ContentBlock";
import { MemorisedDetails } from "./MemorisedDetails";
import { useMarkdown } from "../hooks/useMarkdown";

const Body = styled.section`
  font-size: 14px;
  padding-left: 2em;
`;

export default function PullRequestBody({ msc }: { msc: MSC }) {
  const prBody = useMarkdown({ stripRenderedLink: true }, msc.prBody.markdown);
  if (!prBody) {
    return;
  }
  return (
    <ContentBlock>
      {prBody ? (
        <MemorisedDetails
          storageKey={`msccrafter.pullrequestbodyopen.${msc.prNumber}`}
          defaultValue={msc.state !== MSCState.Closed}
        >
          <summary>Pull request body</summary>
          <Body dangerouslySetInnerHTML={{ __html: prBody }} />
        </MemorisedDetails>
      ) : (
        <p>No Pull Request body provided</p>
      )}
    </ContentBlock>
  );
}
