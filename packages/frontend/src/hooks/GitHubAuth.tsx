import { useLocalStorage } from "@mantine/hooks";
import { graphql } from "@octokit/graphql";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "preact/hooks";
import { viewerInfo } from "../github";
import type { GithubViewer } from "../model/viewer";
import { createContext } from "preact";
import type { PropsWithChildren } from "preact/compat";

interface LoggedIn {
  graphqlWithAuth: ReturnType<typeof graphql.defaults>;
  viewer: GithubViewer;
  logout: () => void;
}

interface LoggedOut {
  getLoginURL: () => Promise<string>;
}


interface OAuth {
  "access_token": string,
  "expires_at":number,
  "refresh_token":string,
  "refresh_token_expires_at":number,
  "token_type": string,
  "scope":string
}

type CurrentState = null | LoggedOut | LoggedIn;
export const AuthContext = createContext<CurrentState>(null);
export const useGitHubAuth = () => useContext(AuthContext);

export function GitHubAuthProvider({ children }: PropsWithChildren) {
  const [storedAuthData, storeGitHubToken] = useLocalStorage<string | null>({
    key: "msccrafter.token",
    getInitialValueInEffect: false, // Ensure we don't flicker. The default value causes the stored auth data to be briefly null.
    defaultValue: null,
  });

  const onTokenExpired = useCallback(async () => {
    if (!storedAuthData) {
      throw Error('Should have been called on oauth data');
    }
    const oauthData = JSON.parse(storedAuthData) as OAuth
    if (Date.now() > oauthData.refresh_token_expires_at) {
      console.log("Refresh token has expired");
      storeGitHubToken(null);
      return;
    }
    const exchangeUrl = new URL('http://localhost:8080/auth/refresh');
    const req = await fetch(exchangeUrl, { body: JSON.stringify({refresh_token: oauthData.refresh_token}), headers: {'Content-Type': 'application/json'}, method: 'POST'});
    const response = await req.json();
    console.log("Storing new token", response);
    storeGitHubToken(JSON.stringify(response));
    setTimeout(() => onTokenExpired, Date.now() - response.expires_at);
  }, []);

  const [viewer, setViewer] = useState<GithubViewer>();
  const graphqlWithAuth = useMemo(() => {
    let token;
    if (!storedAuthData) {
      return null;
    }
    if (storedAuthData.startsWith('{')) {
      const oauthData = JSON.parse(storedAuthData) as OAuth;
      token = oauthData.access_token;
      if (Date.now() > oauthData.expires_at) {
        // If the token has expired. we need to refresh it.
        onTokenExpired();
        return null;
      } else {
        setTimeout(() => onTokenExpired, Date.now() - oauthData.expires_at);
      }
    } else {
      token = storedAuthData;
    }
    return graphql.defaults({
      headers: {
        authorization: `bearer ${token}`,
      },
    });
  }, [storedAuthData]);
  

  const getLoginURL = useCallback(async () => {
    const exchangeUrl = new URL('http://localhost:8080/auth');
    const req = await fetch(exchangeUrl);
    const res = await req.json();
    return res.url;
  }, []);

  // Get viewer info once logged in.
  useEffect(() => {
    if (!graphqlWithAuth) {
      return;
    }
    viewerInfo(graphqlWithAuth)
      .then((viewer) => {
        setViewer(viewer);
      })
      .catch((ex) => {
        console.error("Failed to load viewer info", ex);
        storeGitHubToken(null);
      });
  }, [graphqlWithAuth]);

  // If we're getting a fresh auth token, exchange it.
  useEffect(() => {
    if (storedAuthData) {
      return;
    }
    const authState = new URL(window.location.toString()).searchParams.get('authState');
    if (!authState) {
      return;
    }
    const exchangeUrl = new URL('http://localhost:8080/auth/exchange');
    exchangeUrl.searchParams.set('state', authState);
    (async () => {
      console.log("Exchanging token");
      const req = await fetch(exchangeUrl, { body: JSON.stringify({state: authState}), headers: {'Content-Type': 'application/json'}, method: 'POST'});
      const response = await req.json();
      console.log("Fetching new token", response);
      storeGitHubToken(JSON.stringify(response));
      // Remove state after authing
      window.location.search = "";
    })();
  }, [storedAuthData]);

  let value: CurrentState;
  if (graphqlWithAuth && viewer) {
    value = { graphqlWithAuth, viewer, logout: () => {
      // TODO: Logout token
      storeGitHubToken(null);
    } };
  } else if (storedAuthData) {
    // Loading..
    value = null;
  } else {
    value = { getLoginURL };
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
