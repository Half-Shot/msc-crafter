import { useLocalStorage } from "@mantine/hooks";
import { graphql } from "@octokit/graphql";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";
import { viewerInfo } from "../github";
import type { GithubViewer } from "../model/viewer";
import { createContext } from "preact";
import type { PropsWithChildren } from "preact/compat";

type CurrentState = null|{graphqlWithAuth: ReturnType<typeof graphql.defaults>, viewer: GithubViewer};
export const AuthContext = createContext<CurrentState>(null);
export const useGitHubAuth = () => useContext(AuthContext);


export function GitHubAuthProvider({children}: PropsWithChildren) {
    const [gitHubToken] = useLocalStorage<string|null>({ key: 'msccrafter.token', defaultValue: null });
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

    let value;
    if (!graphqlWithAuth || !viewer) {
        value = null;
    } else {
        value = { graphqlWithAuth, viewer };
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}