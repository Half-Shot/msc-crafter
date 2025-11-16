import "preact/debug";
import { render } from "preact";
import "./index.css";
import { App } from "./components/app.tsx";
import type { MSC } from "./models/MSC.ts";

declare global {
  interface Window {
    crafter: {
      currentMSC?: MSC;
      setGitHubToken?: (token: string) => void,
    };
  }
}
window.crafter = {};

render(<App />, document.getElementById("app")!);
