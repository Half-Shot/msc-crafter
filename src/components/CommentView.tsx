import styled from "styled-components";
import type { Comment } from "../model/MSC";
import Markdown from "react-markdown";

const Container = styled.div`
  padding: 1em;
  &.closed {
    border: 2px dashed red;
  }
`;

const Author = styled.div`
  font-weight: 600;
`;

export default function CommentView({
  comment,
  kind,
}: {
  comment: Comment;
  kind: "closed";
}) {
  if (!comment.body.markdown) {
    return;
  }

  return (
    <Container className={kind}>
      <Author>{comment.author.githubUsername} closed this MSC</Author>
      <Markdown>{comment.body.markdown}</Markdown>
    </Container>
  );
}
