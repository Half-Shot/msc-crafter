import "node:http"
import { IncomingMessage, type RequestListener, Server, ServerResponse } from "node:http";
import { exchangeWebFlowCode, type ExchangeWebFlowCodeGitHubAppOptions, type ExchangeWebFlowCodeGitHubAppResponse, getWebFlowAuthorizationUrl, refreshToken } from "@octokit/oauth-methods";
import { randomUUID } from "node:crypto";

class ApiError extends Error {
    public readonly errcode: string;
    public readonly error: string;
    public readonly statusCode: number;
    constructor(errcode: string, error: string, statusCode = 500) {
        super(`ApiError ${errcode} ${statusCode}: ${error}`)
        this.errcode = errcode;
        this.error = error;
        this.statusCode = statusCode;
    }

    public get responseBuffer(): Buffer {
        return Buffer.from(JSON.stringify({error: this.error, errcode: this.errcode}));
    }
}

const GitHubScopes = ["repo", "gist"];

function assertEnv(key: string): string {
    const v = process.env[key];
    if (typeof v !== "string" || !v) {
        throw Error(`Expected enviroment key is missing ${key}`);
    }
    return v;
}

type StoredAuth = Omit<ExchangeWebFlowCodeGitHubAppResponse["data"],  "expires_in"|"refresh_token_expires_in">&{refresh_token_expires_at: number, expires_at: number}

export class CrafterService {

    private static readJSONBuffer(req: IncomingMessage): Promise<Record<string, unknown>> {
        return new Promise<Record<string, unknown>>((resolve, reject) => {
            const parts: Buffer[] = [];
            let body;
            req.on('data', (chunk) => {
                parts.push(chunk);
            }).on('end', () => {
                body = JSON.parse(Buffer.concat(parts).toString());
                resolve(body)
            }).on('error', reject);
        });
    }


    private readonly stateToCode = new Set<string>();
    private readonly stateToAuth = new Map<string, StoredAuth>();
    private readonly server: Server;
    private readonly githubClientId: string;
    private readonly githubClientSecret: string;
    private readonly redirectUri?: string;
    private readonly frontendRoot: URL;

    constructor() {
        this.server = new Server(this.onRequest);
        this.githubClientId = assertEnv("GITHUB_CLIENT_ID");
        this.githubClientSecret = assertEnv("GITHUB_CLIENT_SECRET");
        this.redirectUri = process.env['GITHUB_REDIRECT_URL'];
        this.frontendRoot = new URL(assertEnv("FRONTEND_URL"));
    }

    public start() {
        this.server.listen(8080, "0.0.0.0");
        console.log("Listening on http://0.0.0.0:8080")
    }

    private readonly onRequest: RequestListener = (req, res) => {
        this.handleRequest(req, res).catch(ex => {
            if (!res.headersSent) {
                const error = ex instanceof ApiError ? ex : new ApiError("MC_UNKNOWN", "Unknown error");
                res.setHeader("Content-Type", "application/json");
                res.writeHead(error.statusCode).end(error.responseBuffer);
            } else if (res.writable) {
                res.end();
            }
        });
    }

    private async handleRequest(req: IncomingMessage, res: ServerResponse) {
        const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
        res.setHeader("Access-Control-Allow-Origin", this.frontendRoot.origin);
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        console.log("Got request", req.method, url.pathname);
        if (url.pathname === '/auth') {
            if (req.method === 'GET') {
                const response = this.onAuthRequest();
                res.setHeader("Content-Type", "application/json");
                res.write(Buffer.from(JSON.stringify(response)));
                res.end();
                return;
            } else {
                throw new ApiError('MC_WRONG_METHOD', 'Unexpected method, expected GET', 405);
            }
        }
        else if (url.pathname === '/auth/callback') {
            if (req.method === 'GET') {
                const state = await this.onAuthCallback(url);
                const redirectUri = new URL("", this.frontendRoot);
                redirectUri.searchParams.set('authState', state);
                res.setHeader("Location", redirectUri.toString());
                res.setHeader("Content-Type", "application/json");
                res.writeHead(307, "Redirecting to app");
                res.end();
                return;
            } else {
                throw new ApiError('MC_WRONG_METHOD', 'Unexpected method, expected GET', 405);
            }
        }
        else if (url.pathname === '/auth/exchange') {
            if (req.method === 'OPTIONS') {
                res.end();
            } else if (req.method === 'POST') {
                const response = this.onAuthExchange(await CrafterService.readJSONBuffer(req) as any);
                res.setHeader("Content-Type", "application/json");
                res.write(Buffer.from(JSON.stringify(response)));
                res.end();
                return;
            } else {
                throw new ApiError('MC_WRONG_METHOD', 'Unexpected method, expected POST', 405);
            }
        }
        else if (url.pathname === '/auth/refresh') {
            if (req.method === 'OPTIONS') {
                res.end();
            } if (req.method === 'POST') {
                const response = await this.onAuthRefresh(await CrafterService.readJSONBuffer(req) as any);
                res.setHeader("Content-Type", "application/json");
                res.write(Buffer.from(JSON.stringify(response)));
                res.end();
                return;
            } else {
                throw new ApiError('MC_WRONG_METHOD', 'Unexpected method, expected POST', 405);
            }
        }
        throw new ApiError('MC_NOT_FOUND', 'No API implemented on this path', 404); 
    }

    private onAuthRequest(): Record<string, unknown> {
        const uniqueState = `mscraft-${randomUUID()}`;
        // TODO: Timeout
        this.stateToCode.add(uniqueState);
        const { url } = getWebFlowAuthorizationUrl({
            clientType: "oauth-app",
            clientId: this.githubClientId,
            scopes: GitHubScopes,
            state: uniqueState,
            redirectUrl: this.redirectUri
        });
        return {url}
    }

    private async onAuthCallback(url: URL): Promise<string> {
        const state = url.searchParams.get('state');
        const code = url.searchParams.get('code');
        if (!state) {
            throw new ApiError('MC_MISSING_PARAM', "'state' param is missing.", 400); 
        }
        if (!code) {
            throw new ApiError('MC_MISSING_PARAM', "'code' param is missing.", 400); 
        }
        if (!this.stateToCode.delete(state)) {
            throw new ApiError('MC_INVALID_STATE', 'State not recongised. The request may have timed out', 401); 
        }
        const { data } = await exchangeWebFlowCode({
            clientType: "github-app",
            clientId: this.githubClientId,
            clientSecret: this.githubClientSecret,
            code,
        } satisfies ExchangeWebFlowCodeGitHubAppOptions);
        if ('refresh_token_expires_in' in data === false) {
            throw new ApiError('MC_UNEXPECTED_GITHUB_RESPONSE', 'Oh no');
        }
        // TODO: Timeout
        this.stateToAuth.set(state, {
            ...data,
            expires_at: Date.now() + (data.expires_in * 1000),
            refresh_token_expires_at: Date.now() + (data.refresh_token_expires_in * 1000),
        });
        return state;
    }

    private onAuthExchange({state}: {state: string}): Record<string, unknown> {
        if (!state) {
            throw new ApiError('MC_MISSING_PARAM', "'state' param is missing.", 400); 
        }
        const authData = this.stateToAuth.get(state);
        if (!authData) {
            throw new ApiError('MC_INVALID_STATE', 'State not recongised. The request may have timed out', 401); 
        }
        this.stateToAuth.delete(state);
        return authData;
    }

    private async onAuthRefresh({refresh_token}: {refresh_token: string}): Promise<Record<string, unknown>> {
        const { data } = await refreshToken({
            clientType: "github-app",
            clientId: this.githubClientId,
            clientSecret: this.githubClientSecret,
            refreshToken: refresh_token
        })
        return {
            ...data,
            expires_at: Date.now() + (data.expires_in * 1000),
            refresh_token_expires_at: Date.now() + (data.refresh_token_expires_in * 1000),
        };
    }
}

if (import.meta.main) {
    const service = new CrafterService();
    service.start();
}