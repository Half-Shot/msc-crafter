import styled from "styled-components";

const Container = styled.footer`
  font-size: 1.25em;
  ul {
    display: flex;
    justify-items: space-evenly;
    list-style: none;
    justify-content: space-evenly;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1em;
  }
`;

export function Footer() {
  return (
    <Container>
      <ul>
        <li>
          <a
            href="https://github.com/Half-Shot/msc-crafter"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <a
            href="https://github.com/Half-Shot/msc-crafter/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            Report a bug
          </a>
        </li>
        <li>
          Crafty Kobold logo by{" "}
          <a
            href="https://mastodon.half-shot.uk/@delph@mastodon.dictatorshipcake.co.uk/115413468961680908"
            target="_blank"
            rel="noreferrer"
          >
            Delph 🐰
          </a>
        </li>
        <li>
          Written with ❤️ by{" "}
          <a
            href="https://mastodon.half-shot.uk/@halfy"
            target="_blank"
            rel="noreferrer"
          >
            Half-Shot 🐶
          </a>
        </li>
      </ul>
    </Container>
  );
}
