/**
 * 빌드 시점에 GitHub Releases 정보를 가져온다.
 * 실패하면 null을 돌려주고, 페이지는 해당 수치를 비운다 (가짜 숫자 금지).
 */
export interface ReleaseInfo {
  version: string;
  publishedAt: string;
  downloads: number;
  url: string;
}

const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'qqoro.github.io-build',
};
const token = process.env.GITHUB_TOKEN;
if (token) headers.Authorization = `Bearer ${token}`;

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    if (!res.ok) {
      console.warn(`[github] ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.warn(`[github] ${path} failed`, e);
    return null;
  }
}

interface Release {
  tag_name: string;
  published_at: string;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
  assets: { download_count: number }[];
}

export async function fetchRelease(repo: string): Promise<ReleaseInfo | null> {
  const all: Release[] = [];
  for (let page = 1; page <= 5; page++) {
    const chunk = await get<Release[]>(`/repos/${repo}/releases?per_page=100&page=${page}`);
    if (!chunk) return null;
    all.push(...chunk);
    if (chunk.length < 100) break;
  }
  const latest = all.find((r) => !r.draft && !r.prerelease);
  if (!latest) return null;
  const downloads = all.reduce(
    (sum, r) => sum + r.assets.reduce((s, a) => s + a.download_count, 0),
    0,
  );
  return {
    version: latest.tag_name,
    publishedAt: latest.published_at,
    downloads,
    url: latest.html_url,
  };
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat('ko-KR').format(n);
}
