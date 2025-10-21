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

function AppWithMSC({ mscNumber }: { mscNumber: number }) {
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

  if (!msc) {
    return <b>Loading MSC {mscNumber}</b>;
  }
  if ("error" in msc) {
    return (
      <div>
        <p>Error loading MSC: </p>
        <pre>{msc.error}</pre>
      </div>
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
      <div style={{ minHeight: "89vh" }}>
        <TopBar />
        {currentMSCNumber ? (
          <AppWithMSC mscNumber={currentMSCNumber} />
        ) : (
          <WelcomeView />
        )}
      </div>
      <Footer />
    </GitHubAuthProvider>
  );
}
