import styled from "styled-components";
import type { Comment } from "../models/MSC";
import Markdown from "./atoms/Markdown";
import { CommentAuthor } from "./atoms/CommentAuthor";

const Container = styled.div`
  padding: 1em;
  &.closed {
    border: 2px dashed red;
  }
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
      <CommentAuthor username={comment.author.githubUsername}>
        closed this MSC
      </CommentAuthor>
      <Markdown>{comment.body.markdown}</Markdown>
    </Container>
  );
}
