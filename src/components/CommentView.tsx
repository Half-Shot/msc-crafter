import styled from "styled-components";
import type { Comment } from "../model/MSC";
import Markdown from "./atoms/Markdown";
import { Author } from "./atoms/Author";

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
      <Author username={comment.author.githubUsername}>closed this MSC</Author>
      <Markdown>{comment.body.markdown}</Markdown>
    </Container>
  );
}
