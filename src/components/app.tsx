import { useMemo } from 'preact/hooks'
import './app.css'
import { useDocumentTitle, useHash } from '@mantine/hooks';
import { useMSC } from '../hooks/useLocalMSCStore';
import { MSCView } from './MSCView';
import { TopBar } from './Topbar';
import { GitHubAuthProvider } from '../hooks/GitHubAuth';
import styled from 'styled-components';

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

const WelcomeContent = styled.div`
  font-size: 20px;
  text-align: center;
`

export function App() {
  const [hash] = useHash();
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
    content = <WelcomeContent>
      <p>Search for an MSC to get started!</p>
    </WelcomeContent>
  }

  

  // Home page of sorts
  return <GitHubAuthProvider>
    <TopBar />
    {content}
  </GitHubAuthProvider>;
}
