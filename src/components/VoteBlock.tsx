import { ContentBlockWithHeading } from "./atoms/ContentBlock";

export function VoteBlock({ votes }: { votes: Record<string, boolean> }) {
  return (
    <ContentBlockWithHeading heading="Votes">
      <h2> Votes </h2>
      {Object.entries(votes).map(([username, vote]) => (
        <p>
          <input disabled type="checkbox" checked={vote} />
          <label>{username}</label>
        </p>
      ))}
    </ContentBlockWithHeading>
  );
}
