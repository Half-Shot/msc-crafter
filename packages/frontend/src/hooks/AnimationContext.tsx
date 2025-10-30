import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import { createContext } from "preact";
import type { PropsWithChildren } from "preact/compat";

type AnimationState = null | {
  isAnimating: boolean;
  addAnimation: (id: string) => void;
  removeAnimation: (id: string) => void;
};

export const AnimationContext = createContext<AnimationState>(null);
export const useAnimationState = () => useContext(AnimationContext)!;

export function AnimationContextProvider({ children }: PropsWithChildren) {
  const [ongoingAnimationCounter, updateAnimationCounter] = useState<
    Set<string>
  >(new Set());
  const addAnimation = useCallback(
    (id: string) => updateAnimationCounter((s) => new Set(s).add(id)),
    [],
  );
  const removeAnimation = useCallback(
    (id: string) =>
      updateAnimationCounter((s) => {
        const newSet = new Set(s);
        newSet.delete(id);
        return newSet;
      }),
    [],
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (ongoingAnimationCounter.size > 0) {
      setIsAnimating(true);
    } else {
      // Delay the close
      timerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
  }, [ongoingAnimationCounter]);

  return (
    <AnimationContext.Provider
      value={{ isAnimating, addAnimation, removeAnimation }}
    >
      {children}
    </AnimationContext.Provider>
  );
}
