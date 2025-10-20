import styled from "styled-components";
import type { Comment } from "../model/MSC";
import { useMarkdown } from "../hooks/useMarkdown";

const Container = styled.div`
    padding: 1em;
    &.closed {
        border: 2px dashed red;
    }
`;


const Author = styled.div`
    font-weight: 600;
`;

export function CommentView({comment, kind}: {comment: Comment, kind: "closed"}) {
    const html = useMarkdown({}, comment.body.markdown);

    if (!html) {
        return;
    }

    return <Container className={kind}>
        <Author>
            {comment.author.githubUsername} closed this MSC
        </Author>
        <p dangerouslySetInnerHTML={{__html: html}}></p>
    </Container>
} 