import { useEffect } from "preact/hooks";
import "./app.css";
import { useDocumentTitle } from "@mantine/hooks";
import { useMSC } from "../hooks/useLocalMSCStore";
import { MSCView } from "./MSCView";
import { TopBar } from "./Topbar";
import { GitHubAuthProvider } from "../hooks/GitHubAuth";
import { useRecentMSCs } from "../hooks/useRecentMSCs";
import { WelcomeView } from "./WelcomeView";
import { Footer } from "./Footer";
import { CurrentMSCContextProvider } from "../hooks/CurrentMSCContext";
import { useAppHash } from "../hooks/useAppHash";
import { NumericLoader } from "./atoms/NumericLoader";
import {
  AnimationContextProvider,
  useAnimationState,
} from "../hooks/AnimationContext";
import { Notice } from "./atoms/Notice";

function AppWithMSC({ mscNumber }: { mscNumber: number }) {
  const { isAnimating } = useAnimationState();
  const msc = useMSC(mscNumber, true, true);
  const [, addRecentCount] = useRecentMSCs();
  useDocumentTitle(
    msc && "error" in msc === false
      ? `MSC Crafter - ${msc.title} `
      : `MSC Crafter - Loading ${mscNumber}`,
  );

  useEffect(() => {
    if (msc && "error" in msc === false) {
      addRecentCount({ title: msc.title, hash: `#msc/${msc.prNumber}` });
    }
  }, [msc]);

  if (!msc || isAnimating || "error" in msc) {
    const mscError = msc && "error" in msc && msc.error;
    return (
      <>
        <NumericLoader mscNumber={mscNumber} ready={!!msc} error={!!mscError} />
        {mscError && (
          <Notice heading="Error loading MSC" kind="error">
            {mscError}
          </Notice>
        )}
      </>
    );
  }
  return (
    <CurrentMSCContextProvider msc={msc}>
      <MSCView />
    </CurrentMSCContextProvider>
  );
}

export function App() {
  const currentMSCNumber = useAppHash();

  return (
    <GitHubAuthProvider>
      <AnimationContextProvider>
        <div style={{ minHeight: "89vh" }}>
          <TopBar />
          {currentMSCNumber ? (
            <AppWithMSC mscNumber={currentMSCNumber} />
          ) : (
            <>
              <WelcomeView />
            </>
          )}
        </div>
      </AnimationContextProvider>
      <Footer />
    </GitHubAuthProvider>
  );
}
