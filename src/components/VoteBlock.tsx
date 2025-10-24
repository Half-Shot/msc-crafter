import { ContentBlock } from "./atoms/ContentBlock";

export function VoteBlock({ votes }: { votes: Record<string, boolean> }) {
  return (
    <ContentBlock>
      <h2> Votes </h2>
      {Object.entries(votes).map(([username, vote]) => (
        <p>
          <input disabled type="checkbox" checked={vote} />
          <label>{username}</label>
        </p>
      ))}
    </ContentBlock>
  );
}
