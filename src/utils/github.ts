import fs from 'node:fs/promises';
import path from 'node:path';

export interface GitHubConfig {
    owner: string;
    repo: string;
    branch: string;
    token: string;
}

export const getGitHubConfig = (): GitHubConfig => {
    return {
        owner: process.env.GITHUB_OWNER || '',
        repo: process.env.GITHUB_REPO || '',
        branch: process.env.GITHUB_BRANCH || 'main',
        token: process.env.GITHUB_TOKEN || ''
    };
};

const isDev = import.meta.env ? import.meta.env.DEV : process.env.NODE_ENV === 'development';
const getLocalPath = (p: string) => path.join(process.cwd(), p);

export async function fetchFromGitHub(path: string) {
    if (isDev) {
        try {
            const content = await fs.readFile(getLocalPath(path), 'utf-8');
            return { content: Buffer.from(content).toString('base64'), sha: 'local-sha' };
        } catch {
            return null;
        }
    }

    const config = getGitHubConfig();
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return await response.json();
}

export async function saveToGitHub(path: string, content: string, message: string) {
    if (isDev) {
        const fullPath = getLocalPath(path);
        await fs.mkdir(fullPath.substring(0, fullPath.lastIndexOf('/')), { recursive: true });
        await fs.writeFile(fullPath, content, 'utf-8');
        return { commit: { sha: 'local-commit-sha' } };
    }

    const config = getGitHubConfig();
    const existingFile = await fetchFromGitHub(path);
    const sha = existingFile ? existingFile.sha : undefined;

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
    const base64Content = Buffer.from(content).toString('base64');

    const body: any = {
        message,
        content: base64Content,
        branch: config.branch
    };

    if (sha) body.sha = sha;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`Failed to save to GitHub: ${response.statusText}`);
    return await response.json();
}

export async function deleteFromGitHub(path: string, message: string) {
    if (isDev) {
        try {
            await fs.unlink(getLocalPath(path));
        } catch (e) {
            console.error("Local delete error:", e);
        }
        return { commit: { sha: 'local-delete-sha' } };
    }

    const config = getGitHubConfig();
    const existingFile = await fetchFromGitHub(path);
    if (!existingFile) throw new Error("File not found");

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
    
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message,
            sha: existingFile.sha,
            branch: config.branch
        })
    });

    if (!response.ok) throw new Error(`Failed to delete from GitHub: ${response.statusText}`);
    return await response.json();
}
