import { useEffect, useState } from "preact/hooks";
import styled from "styled-components";
import { useAnimationState } from "../../hooks/AnimationContext";

const BigNumber = styled.span`
    font-size: 2em;
    width: 1em;
    display: block;
    text-align: center;
    font-family: var(--mc-font-monospace);
    pointer-events: none;
    @media (prefers-reduced-motion: no-preference) {
        &.animate {
            will-change: transform; /* We should be nice to the browser - let it know what we're going to animate. */
            animation: scrolling 1s linear infinite;
        }
    }   
  }
`;

const CountContainer = styled.div`
  overflow: clip;
  height: 3em;
  width: fit-content;
  display: flex;
  pointer-events: none;
  background: var(--mc-color-text-fg);
  gap: 0.1em;
  border-radius: 0.2em;
  color: var(--mc-color-bg);
  &.error {
    color: var(--mc-color-error);
  }
`;

const Container = styled.div`
  display: flex;
  gap: 1em;
  margin-top: 5em;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
`;

const LoadingText = styled.span`
  font-size: 1.5em;
  margin-top: auto;
  margin-bottom: auto;
`;

function Digit({
  children,
  fixed,
  index,
}: {
  children: string;
  fixed: boolean;
  index: number;
}) {
  const { addAnimation, removeAnimation } = useAnimationState();
  const [isActuallyFixed, setFixed] = useState(fixed);

  useEffect(() => {
    if (isActuallyFixed) {
      removeAnimation("numericloader-" + index);
    } else {
      addAnimation("numericloader-" + index);
    }
  }, [isActuallyFixed, addAnimation, removeAnimation]);

  useEffect(() => {
    if (isActuallyFixed) {
      return;
    }
    if (fixed) {
      setTimeout(() => setFixed(true), (index + 1) * 300);
    }
  }, [fixed]);

  if (isActuallyFixed) {
    return <BigNumber>{children}</BigNumber>;
  }

  // Scroll effect
  return <BigNumber className="animate">0 1 2 3 4 5 6 7 8 9 0 1</BigNumber>;
}

export function NumericLoader({
  mscNumber,
  ready,
  error,
}: {
  mscNumber: number;
  ready: boolean;
  error: boolean;
}) {
  return (
    <Container>
      <LoadingText>Loading MSC</LoadingText>
      <CountContainer className={error ? "error" : ""}>
        {mscNumber
          .toString()
          .split("")
          .map((s, i) => (
            <Digit fixed={ready} index={i} key={i}>
              {s}
            </Digit>
          ))}
      </CountContainer>
    </Container>
  );
}
