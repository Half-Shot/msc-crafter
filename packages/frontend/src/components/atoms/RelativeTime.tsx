import styled from "styled-components";
import { humanDuration } from "../../time";

const Container = styled.time`
  text-decoration: underline dashed;
`;

export default function RelativeTime({ children }: { children: Date }) {
  return (
    <Container
      title={children.toLocaleString()}
      dateTime={children.toISOString()}
    >
      {humanDuration(children)}
    </Container>
  );
}
