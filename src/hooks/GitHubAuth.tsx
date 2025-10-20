import { useLocalStorage } from "@mantine/hooks";
import { graphql } from "@octokit/graphql";
import { useCallback, useContext, useEffect, useMemo, useState } from "preact/hooks";
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
    checkAndStoreToken: (token: string) => Promise<void>;
}

type CurrentState = null|LoggedOut|LoggedIn;
export const AuthContext = createContext<CurrentState>(null);
export const useGitHubAuth = () => useContext(AuthContext);


export function GitHubAuthProvider({children}: PropsWithChildren) {
    const [gitHubToken, storeGitHubToken] = useLocalStorage<string|null>({ key: 'msccrafter.token', defaultValue: null });
    const [viewer, setViewer] = useState<GithubViewer>();
    const graphqlWithAuth = useMemo(() => {
        if (!gitHubToken) {
            return null;
        }
        return graphql.defaults({
            headers: {
                authorization: `token ${gitHubToken}`,
            },
        });
    }, [gitHubToken]);

    const checkAndStoreToken = useCallback(async (token: string) => {
        const gql = graphql.defaults({
            headers: {
                authorization: `token ${token}`,
            },
        });
        await viewerInfo(gql);
        storeGitHubToken(token);
    }, []);

    // Get viewer info once logged in.
    useEffect(() => {
        if (!graphqlWithAuth) {
            return;
        }
        viewerInfo(graphqlWithAuth).then((viewer) => {
            setViewer(viewer);
        }).catch((ex) => {
            console.error("Failed to load viewer info", ex);
        });
    }, [graphqlWithAuth]);

    let value: CurrentState;
    if (graphqlWithAuth && viewer) {
        value = { graphqlWithAuth, viewer, logout: () => storeGitHubToken(null) };
    } else if (gitHubToken) {
        value = null;
    } else {
        value = { checkAndStoreToken };
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}