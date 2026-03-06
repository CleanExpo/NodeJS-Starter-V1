export interface LinearIssue {
  title: string;
  description: string;
  priority: 0 | 1 | 2 | 3 | 4; // 0=no priority, 1=urgent, 2=high, 3=medium, 4=low
  teamId: string;
}

export interface LinearCreatedIssue {
  id: string;
  url: string;
}

interface GraphQLResponse {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string }>;
}

export function createLinearClient(apiKey: string) {
  const BASE_URL = 'https://api.linear.app/graphql';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: apiKey,
  };

  async function graphql(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const json = (await res.json()) as GraphQLResponse;
    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }
    return json.data ?? {};
  }

  return {
    async createIssue(issue: LinearIssue): Promise<LinearCreatedIssue> {
      const data = await graphql(
        `
          mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              issue {
                id
                url
              }
            }
          }
        `,
        { input: issue }
      );
      const result = (data['issueCreate'] as Record<string, unknown>)[
        'issue'
      ] as LinearCreatedIssue;
      return result;
    },

    async listTeams(): Promise<Array<{ id: string; name: string }>> {
      const data = await graphql(`
        query {
          teams {
            nodes {
              id
              name
            }
          }
        }
      `);
      const teams = (data['teams'] as Record<string, unknown>)['nodes'] as Array<{
        id: string;
        name: string;
      }>;
      return teams;
    },
  };
}
