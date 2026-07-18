declare module 'routeros-client' {
  export class RouterOSClient {
    constructor(config: Record<string, unknown>);
    connect(): Promise<RouterOSAPI>;
    close(): Promise<void>;
  }

  export interface RouterOSCommands {
    where(key: string, value?: string): RouterOSCommands;
    get(): Promise<Record<string, string>[]>;
    getOnly(): Promise<Record<string, string>>;
    add(data: Record<string, string>): Promise<Record<string, string> | null>;
    remove(id?: string): Promise<unknown>;
  }

  export interface RouterOSAPI {
    menu(path: string): RouterOSCommands;
    close(): Promise<void>;
  }
}
