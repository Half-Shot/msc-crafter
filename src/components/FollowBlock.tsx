import { useMediaQuery, useWindowScroll } from "@mantine/hooks";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PropsWithChildren,
} from "preact/compat";
import styled from "styled-components";

const Container = styled.div`
  &.follow {
    position: fixed;
    top: 0;
  }
`;

export function FollowBlock(props: PropsWithChildren) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery("screen and (max-width: 1366px)");
  const [scrollData] = useWindowScroll();
  const [fixedCheckPoint, setFixedCheckPoint] = useState<number | null>();


  useEffect(() => {
    if (isSmallScreen) {
      setFixedCheckPoint(null);
      return;
    }
    if (fixedCheckPoint && scrollData.y < fixedCheckPoint) {
      setFixedCheckPoint(null);
    } else if (!fixedCheckPoint && ref.current) {
      const bounds = ref.current.getBoundingClientRect();
      if (bounds.y < 0) {
        setFixedCheckPoint(scrollData.y);
      }
    }
  }, [scrollData, ref.current, isSmallScreen]);

  return (
    <Container id={id} ref={ref} className={fixedCheckPoint ? "follow" : ""}>
      {props.children}
    </Container>
  );
}
