export interface ResolveMSCResponse {
  viewer: {
    login: string,
  },
  "repository": {
    "pullRequest": {
      "id": string,
      "title": string,
      "state": "OPEN"|"CLOSED"|"MERGED",
      "lastEditedAt": string,
      "createdAt": string,
      "isDraft": boolean,
      files: {
        nodes: {
          path: string
        }[]
      },
      headRef: {
        name: string,
      },
      headRepository: {
        nameWithOwner: string,
      }
      "latestReviews": {
        "nodes": 
          {
            "id": string,
            "author": {
              "login": string,
              "avatarUrl": string,
            },
            "state": "COMMENTED"|"CHANGES_REQUESTED"|"APPROVED",
            "body": string,
          }[],
      },
      "labels": {
        "nodes":
          {
            "id": string,
            "name": string,
            "color": string,
            "description": null
          }[],
      },
      "comments": {
        "totalCount": number,
        "pageInfo": {
          "hasNextPage": boolean
        },
        "nodes": 
          {
            "id": string,
            "author": {
              "avatarUrl": string,
              "login": string
            },
            "body": string,
            "createdAt": string,
            "minimizedReason": null
          }[],
      } 
      "url": string,
      "author": {
        "avatarUrl": string,
        "login": string,
      },
      "body": string,
    }
  }
}