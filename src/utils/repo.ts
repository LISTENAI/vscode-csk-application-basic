import { SimpleGit } from 'simple-git';
import { execa } from 'execa';


export async function getCommit(git: SimpleGit): Promise<string | null> {
    let commit;
    try {
        commit = (await git.revparse(['--short', 'HEAD'])).trim();
        return commit;
    } catch (e) {
        return null;
    }
}

export async function getBranch(git: SimpleGit): Promise<string | null> {
    let branch;
    try {
        branch = (await git.raw(['symbolic-ref', '--short', 'HEAD'])).trim();
        return branch;
    } catch (e) {
        return null;
    }
}

export async function clean(git: SimpleGit): Promise<boolean> {
    const status = await git.status(['--porcelain']);
    return status.isClean();
}


export async function getTag(path: string): Promise<string> {
    try {
        const res = await execa('git', ['describe', '--abbrev=0', '--tags'], {
            cwd: path
        });
        return res.stdout || '';
    } catch (error) {
        return ''
    }
}

export async function getRemote(path: string): Promise<string> {
    try {
        const res = await execa('git', ['remote', '-v'], {
            cwd: path
        });
        return res.stdout || '';
    } catch (error) {
        return ''
    }
}