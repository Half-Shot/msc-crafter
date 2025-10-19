import { useMemo, useState } from 'preact/hooks'
import './app.css'
import { useDocumentTitle, useHash } from '@mantine/hooks';
import { useMSC } from '../hooks/useLocalMSCStore';
import { MSCView } from './MSCView';

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
  const msc = useMSC(currentMSCNumber ?? undefined);
  useDocumentTitle(msc && 'error' in msc === false ?  `MSC Crafter - ${msc.title} ` : `MSC Crafter`);

  if (currentMSCNumber) {
    if (msc === null) {
      return <b>Loading MSC</b>;
    } else if ('error' in msc) {
      return <div>
        <p>Error loading MSC: </p>
        <pre>
          {msc.error}
        </pre>
      </div>
    } else {
      return <MSCView msc={msc} />;
    }
  }

  // Home page of sorts
  return (
    <>
      <h1>MSC Crafter</h1>
      <div class="card">
        <button onClick={() => setHash('msc/4140')}>
          Open MSC4140
        </button>
      </div>
    </>
  )
}
