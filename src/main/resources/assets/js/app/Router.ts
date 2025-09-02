import hasher from 'hasher';

export class Router {
    static setHash(path: string): void {
        hasher.changed.active = false;
        hasher.setHash(path);
        hasher.changed.active = true;
    }

    static getPath(): string {
        return window.location.hash ? window.location.hash.substr(1) : '/';
    }
}
