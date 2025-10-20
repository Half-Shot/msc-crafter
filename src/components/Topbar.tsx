import styled from "styled-components";
import { MSCSearch } from "./MSCSearch";
import { AuthButton } from "./AuthButton";


const Container = styled.header`
    font-size: 24pt;
    width: 100%;
    max-width: 66vw;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 1em;
    flex: 3;
    justify-content: space-between;
`;

const Left = styled.span`
    flex: 1;
    max-width: fit-content;
`
const Right = styled.span`
    font-size: 0.5em;
`
const AppName = styled.span`
    font-weight: 600;
    font-size: 1em;
    width: fit-content;
    flex: 1;
    margin-right: 1em;
`

export function TopBar() {
    return <Container>
        <Left>
            <AppName>MSC Crafter</AppName>
        </Left>
        <Left>
            <MSCSearch/>
        </Left>
        <Right>
            <AuthButton />
        </Right>
    </Container>
}