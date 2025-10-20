import type { MSC } from "../model/MSC";
import type { ResolveMSCResponse } from "./queries/resolveMSC";

const SynapseRegex = /https:\/\/github.com\/(?:matrix-org|element-hq)\/synapse\/pull\/(\d+)/g;
const SynapseShortRegex = /\/(matrix-org|element-hq)\/synapse#(\d+)/g;
const MatrixJsSdkUrlRegex = /https:\/\/github.com\/matrix-org\/matrix-js-sdk\/pull\/(\d+)/g;
const MatrixJsSdkShortRegex = /\/matrix-org\/matrix-js-sdk#(\d+)/g;
const ComplementRegex = /https:\/\/github.com\/matrix-org\/complement\/pull\/(\d+)/g;
const GitHubLinkedPR = /([^\/\s]+)\/([^\/\d]+)#(\d+)/g;
const GenericGitHubProjectRegex = /https:\/\/github.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/g;
const GenericGitLabProjectRegex = /https:\/\/gitlab.com\/([^\/]+)\/([^\/]+)\/-\/merge_requests\/(\d+)/g;

export function getImplementationsFromString(body: string): MSC["implementations"] {
    const impls: MSC["implementations"] = [];
    for (const match of body.matchAll(SynapseRegex)) {
        impls.push({title: `Synapse #${match[1]}`, url: match[0]})
        body = body.replace(match[0], '');
    }
    for (const match of body.matchAll(SynapseShortRegex)) {
        impls.push({title: `Synapse #${match[1]}`, url: `https://github.com/${match[1]}/synapse/pull/${match[2]}`})
        body = body.replace(match[0], '');
    }
    for (const match of body.matchAll(MatrixJsSdkUrlRegex)) {
        impls.push({title: `Matrix JS SDK #${match[1]}`, url: match[0]})
        body = body.replace(match[0], '');
    }
    for (const match of body.matchAll(MatrixJsSdkShortRegex)) {
        impls.push({title: `Matrix JS SDK #${match[1]}`, url: `https://github.com/matrix-org/matrix-js-sdk/pull/${match[1]}`})
        body = body.replace(match[0], '');
    }
    for (const match of body.matchAll(ComplementRegex)) {
        impls.push({title: `Complement #${match[1]}`, url: match[0]})
        body = body.replace(match[0], '');
    }
    for (const [url, org, repo, prNumber] of body.matchAll(GenericGitHubProjectRegex)) {
        // Hide spec repos
        if (org === 'matrix-org' && ['matrix-spec', 'matrix-spec-proposals', 'matrix-doc'].includes(repo)) {
            continue;
        }
        impls.push({title: `GitHub ${org}/${repo} #${prNumber}`, url})
        body = body.replace(url, '');
    }
    for (const [stringMatch, org, repo, prNumber] of body.matchAll(GitHubLinkedPR)) {
        // Hide spec repos
        if (org === 'matrix-org' && ['matrix-spec', 'matrix-spec-proposals', 'matrix-doc'].includes(repo)) {
            continue;
        }
        impls.push({title: `GitHub ${org}/${repo} #${prNumber}`, url: `https://github.com/${org}/${repo}/pull/${prNumber}`})
        body = body.replace(stringMatch, '');
    }
    for (const [url, org, repo, prNumber] of body.matchAll(GenericGitLabProjectRegex)) {
        impls.push({title: `GitLab ${org}/${repo} #${prNumber}`, url})
        body = body.replace(url, '');
    }
    return impls;
}

export function getImplementationsFromThreads(pullRequest: ResolveMSCResponse["repository"]["pullRequest"], proposalText: string|null): MSC["implementations"] {
    const implThread = pullRequest.reviewThreads.nodes.find(rT => rT.comments.nodes.some(c => c.body.startsWith("Implementation requirements:")));
    const impls: MSC["implementations"] = [];
    // This section attempts to parse the implementations thread to pull known implementations.
    for (const comment of implThread?.comments.nodes ?? []) {
        impls.push(...getImplementationsFromString(comment.body));
    }
    impls.push(...getImplementationsFromString(pullRequest.body));
    if (proposalText) {
        impls.push(...getImplementationsFromString(proposalText));
    }
    
    return impls;
}