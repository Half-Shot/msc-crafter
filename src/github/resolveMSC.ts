import {
  MSCState,
  type ClosedMSC,
  type Comment,
  type MSC,
  type ProposedState,
} from "../model/MSC";
import { graphql as GraphQL } from "@octokit/graphql";
import resolveMSCQuery from "../github/queries/resolveMSC.gql?raw";
import resolveMSCCommentsQuery from "../github/queries/resolveMSCComments.gql?raw";
import resolveMSCReviewThreadsQuery from "../github/queries/resolveMSCReviewThreads.gql?raw";
import type {
  ResolveMSCCommentsResponse,
  ResolveMSCResponse,
  ResolveMSCResponseComment,
  ResolveMSCReviewThreadsResponse,
} from "./queries/resolveMSC";
import { getImplementationsFromText } from "./implementationParser";

type ResolvedPR = ResolveMSCResponse["repository"]["pullRequest"];

function determineMSCState(pullRequest: ResolvedPR): MSCState {
  if (pullRequest.state === "CLOSED") {
    return MSCState.Closed;
  } else if (pullRequest.state === "MERGED") {
    return MSCState.Merged;
  } else if (pullRequest.isDraft) {
    return MSCState.Draft;
  }

  if (
    pullRequest.labels.nodes.some(
      (s) => s.name === "finished-final-comment-period",
    )
  ) {
    return MSCState.ProposedMerge;
  }

  if (pullRequest.labels.nodes.some((s) => s.name === "final-comment-period")) {
    return MSCState.FinalCommentPeriod;
  }

  if (
    pullRequest.labels.nodes.some(
      (s) => s.name === "proposed-final-comment-period",
    )
  ) {
    return MSCState.ProposedFinalCommentPeriod;
  }
  return MSCState.Open;
}

async function loadProposal(pullRequest: ResolvedPR): Promise<string | null> {
  const filePath = pullRequest.files.nodes.find((f) =>
    f.path.match(/^proposals\/.+\.md$/),
  )?.path;
  if (!filePath) {
    return null;
  }
  const branch =
    pullRequest.state === "MERGED" ? "main" : pullRequest.headRef?.name;
  const name =
    pullRequest.state === "MERGED"
      ? "matrix-org/matrix-spec-proposals/refs/heads"
      : pullRequest.headRepository.nameWithOwner;
  if (!branch) {
    return null;
  }
  const req = await fetch(
    `https://raw.githubusercontent.com/${name}/${branch}/${filePath}`,
  );
  if (!req.ok) {
    throw Error("Failed to fetch proposal body");
  }
  return await req.text();
}

function getTickBoxState(
  pullRequest: ResolveMSCCommentsResponse["repository"]["pullRequest"],
  expectedState: ProposedState,
): MSC["proposalState"] | undefined {
  // TODO: Paginate
  const comment = pullRequest.comments.nodes.find((c) => {
    if (c.author.login !== "mscbot") {
      return false;
    }
    switch (expectedState) {
      case MSCState.ProposedClose:
        return c.body.match(
          /Team member @(.+) has proposed to \*\*close\*\* this./,
        );
      case MSCState.ProposedFinalCommentPeriod:
        return c.body.match(
          /Team member @(.+) has proposed to \*\*merge\*\* this./,
        );
    }
  });
  if (!comment) {
    return undefined;
  }
  // Parse checklist
  const results = comment?.body.matchAll(/- \[(x| )\] @(.+)/g);
  return Object.fromEntries(
    [...results].map(([, checkedStr, username]) => [
      username,
      checkedStr === "x",
    ]),
  );
}

/**
 * Get a MSC from GitHub.
 * @param graphql The authenticated graphql instance.
 * @param mscNumber The MSC to request
 * @param fullRender Whether to return a full MSC response, or skip details that would require more requests.
 * @returns
 */
export async function resolveMSC(
  graphql: typeof GraphQL,
  mscNumber: number,
  fullRender: boolean,
): Promise<MSC> {
  const { repository } = await graphql<ResolveMSCResponse>(resolveMSCQuery, {
    num: mscNumber,
  });
  const proposalText = await loadProposal(repository.pullRequest);

  // Mentioned MSCs
  const mentionedProposals = new Set(
    proposalText?.match(/MSC\s?\d+/gi)?.map((s) => parseInt(s.slice(3))) ?? [],
  );
  repository.pullRequest.body
    ?.match(/MSC\s?\d+/gi)
    ?.map((s) => parseInt(s.slice(3)))
    .forEach((s) => mentionedProposals.add(s));
  mentionedProposals.delete(mscNumber);

  const state = determineMSCState(repository.pullRequest);

  // Determine proposal kind through labels
  const kind = repository.pullRequest.labels.nodes
    .filter((l) => l.name.startsWith("kind:"))
    .map((l) => l.name.slice("kind:".length));

  const msc = {
    prNumber: mscNumber,
    created: new Date(repository.pullRequest.createdAt),
    updated: new Date(
      repository.pullRequest.commits.nodes[0].commit.authoredDate,
    ),
    title: repository.pullRequest.title,
    state,
    url: repository.pullRequest.url,
    reactions: {},
    prBody: {
      markdown: repository.pullRequest.body,
    },
    author: {
      githubUsername: repository.pullRequest.author.login,
    },
    requires: [],
    dependents: [],
    body: {
      markdown: proposalText,
    },
    comments: [],
    threads: [],
    mentionedMSCs: [...mentionedProposals],
    implementations: [],
    kind,
  } as MSC;

  // Extra requests for fullRender

  if (fullRender) {
    const reviewThreads = await graphql<ResolveMSCReviewThreadsResponse>(
      resolveMSCReviewThreadsQuery,
      {
        num: mscNumber,
      },
    );
    msc.implementations = getImplementationsFromText(
      repository.pullRequest,
      reviewThreads.repository.pullRequest,
      proposalText,
    );
    msc.threads = reviewThreads.repository.pullRequest.reviewThreads.nodes.map(
      (thread) => ({
        resolved: thread.isResolved,
        line: thread.line,
        // Fix Type
        comments: thread.comments.nodes.map(
          (c) =>
            ({
              body: { markdown: c.body },
              author: {
                githubUsername: c.author.login,
              },
              created: new Date(c.createdAt),
            }) satisfies Comment,
        ) as [Comment],
      }),
    );
  }

  if (
    (fullRender && state === MSCState.ProposedClose) ||
    state === MSCState.ProposedFinalCommentPeriod
  ) {
    const comments = await graphql<ResolveMSCCommentsResponse>(
      resolveMSCCommentsQuery,
      {
        num: mscNumber,
      },
    );
    msc.proposalState = getTickBoxState(comments.repository.pullRequest, state);
  } else if (fullRender && state === MSCState.Closed) {
    const comments = await graphql<ResolveMSCCommentsResponse>(
      resolveMSCCommentsQuery,
      {
        num: mscNumber,
      },
    );
    // No GQL api for this, which sucks.
    const closedAtDate = new Date(repository.pullRequest.closedAt);
    let closestComment: ResolveMSCResponseComment | undefined;
    let currentTimeDiff = Number.MAX_SAFE_INTEGER;
    for (const comment of comments.repository.pullRequest.comments.nodes) {
      const timeDiff = Math.abs(
        new Date(comment.createdAt).getTime() - closedAtDate.getTime(),
      );
      if (timeDiff < currentTimeDiff) {
        currentTimeDiff = timeDiff;
        closestComment = comment;
      }
    }
    return {
      ...msc,
      state: MSCState.Closed,
      closingComment: closestComment && {
        author: {
          githubUsername: closestComment.author.login,
        },
        body: {
          markdown: closestComment.body,
        },
        created: new Date(closestComment.createdAt),
      },
    } as ClosedMSC;
  }
  return msc;
}
