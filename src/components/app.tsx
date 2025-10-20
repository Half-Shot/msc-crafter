import { useMemo } from 'preact/hooks'
import './app.css'
import { useDocumentTitle, useHash } from '@mantine/hooks';
import { useMSC } from '../hooks/useLocalMSCStore';
import { MSCView } from './MSCView';
import { TopBar } from './Topbar';
import { GitHubAuthProvider } from '../hooks/GitHubAuth';

function AppWithMSC({mscNumber}: {mscNumber: number}) {
  const msc = useMSC(mscNumber, false);
  useDocumentTitle(msc && 'error' in msc === false ?  `MSC Crafter - ${msc.title} ` : `MSC Crafter - Loading ${mscNumber}`);
  if (!msc) {
    return <b>Loading MSC {mscNumber}</b>;
  }
  if ('error' in msc) {
    return <div>
      <p>Error loading MSC: </p>
      <pre>
        {msc.error}
      </pre>
    </div>;
  }
  return <MSCView msc={msc} />;
}

export function App() {
  const [hash, setHash] = useHash();
  const currentMSCNumber = useMemo(() => {
    if (hash.startsWith('#msc/')) {
      let currentMSCNumber = parseInt(hash.slice('#msc/'.length).split('/',2)[0]);
      if (!isNaN(currentMSCNumber)) {
        return currentMSCNumber;
      }
    }
    return null;
  }, [hash]);

  let content;

  if (currentMSCNumber) {
    content = <AppWithMSC mscNumber={currentMSCNumber}/>
  } else {
    content = 
      <div class="card">
        <button onClick={() => setHash('msc/4140')}>
          Open MSC4140
        </button>
      </div>;
  }

  

  // Home page of sorts
  return <GitHubAuthProvider>
    <TopBar />
    {content}
  </GitHubAuthProvider>;
}
