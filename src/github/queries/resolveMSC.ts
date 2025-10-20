
export interface ResolveMSCResponseComment {
  "id": string,
  "author": {
    "avatarUrl": string,
    "login": string
  },
  "body": string,
  "createdAt": string,
  "minimizedReason": null
}

export interface ResolveMSCResponse {
  "repository": {
    "pullRequest": {
      "id": string,
      "title": string,
      "state": "OPEN"|"CLOSED"|"MERGED",
      "lastEditedAt": string,
      "createdAt": string,
      closedAt: string,
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
      },
      reviewThreads: {
				nodes: {
          id: string,
					comments: {
						nodes: ResolveMSCResponseComment[],
					}
				}[]
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
        "nodes": ResolveMSCResponseComment[],
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