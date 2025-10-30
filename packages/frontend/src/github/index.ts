import { graphql as GraphQL } from "@octokit/graphql";
import viewerInfoQuery from "../github/queries/viewerInfo.gql?raw";
import searchMSCsQuery from "../github/queries/searchMSCs.gql?raw";
import type { ViewerInfoResponse } from "./queries/viewerInfo";
import type { SearchMCSCsResponse } from "./queries/searchMSCs";

export * from "./resolveMSC";

export async function viewerInfo(
  graphql: typeof GraphQL,
): Promise<ViewerInfoResponse["viewer"]> {
  const { viewer } = await graphql<ViewerInfoResponse>(viewerInfoQuery);
  return viewer;
}

export async function searchForMSCs(
  graphql: typeof GraphQL,
  query: string,
): Promise<SearchMCSCsResponse["search"]["nodes"]> {
  // N.B We don't stop the user from breaking out of this query, if they want to break their
  // own app then that's fine.
  const { search } = await graphql<SearchMCSCsResponse>(searchMSCsQuery, {
    searchQ: `repo:matrix-org/matrix-spec-proposals ${query}`,
  });
  return search.nodes;
}
