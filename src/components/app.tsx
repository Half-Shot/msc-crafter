import { useEffect, useMemo } from "preact/hooks";
import "./app.css";
import { useDocumentTitle, useHash } from "@mantine/hooks";
import { useMSC } from "../hooks/useLocalMSCStore";
import { MSCView } from "./MSCView";
import { TopBar } from "./Topbar";
import { GitHubAuthProvider } from "../hooks/GitHubAuth";
import styled from "styled-components";
import { useRecentMSCs } from "../hooks/useRecentMSCs";
import { WelcomeView } from "./WelcomeView";

function AppWithMSC({ mscNumber }: { mscNumber: number }) {
  const msc = useMSC(mscNumber, false);
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
  return <MSCView msc={msc} />;
}

export function App() {
  const [hash] = useHash();
  const currentMSCNumber = useMemo(() => {
    if (hash.startsWith("#msc/")) {
      let currentMSCNumber = parseInt(
        hash.slice("#msc/".length).split("/", 2)[0],
      );
      if (!isNaN(currentMSCNumber)) {
        return currentMSCNumber;
      }
    }
    return null;
  }, [hash]);

  let content;
  if (currentMSCNumber) {
    content = <AppWithMSC mscNumber={currentMSCNumber} />;
  } else {
    content = <WelcomeView />;
  }

  // Home page of sorts
  return (
    <GitHubAuthProvider>
      <TopBar />
      {content}
    </GitHubAuthProvider>
  );
}
