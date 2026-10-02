function getHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }
  return headers;
}

export async function fetchBranches(repo: string, token?: string): Promise<string[]> {
  if (!repo.includes('/')) return [];
  const [owner, repoName] = repo.split('/');
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/branches`, {
      headers: getHeaders(token),
    });
    const data = await res.json();
    return Array.isArray(data) ? data.map((b: { name: string }) => b.name) : [];
  } catch {
    return [];
  }
}

export async function createPullRequest(
  repo: string,
  token: string,
  head: string,
  base: string,
  title: string,
  body?: string
) {
  const [owner, repoName] = repo.split('/');
  const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pulls`, {
    method: 'POST',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      head,
      base,
      body: body || 'Created via ProjectFlow Code Studio.',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create pull request');
  }
  return data;
}