import { MATOMO_URL, SUPERUSER, DEFAULT_PASSWORD, RUN_ID } from './env';

export class ApiError extends Error {}

type Params = Record<string, string | number | boolean | Array<string | number> | undefined>;

function encode(params: Params): URLSearchParams {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => body.append(`${key}[]`, String(v)));
    } else {
      body.append(key, String(value));
    }
  }
  return body;
}

/**
 * Minimal Matomo HTTP API client authenticated with a token_auth (sent via POST).
 */
export class MatomoApi {
  constructor(public readonly login: string, public readonly tokenAuth: string) {}

  static async forUser(login: string, password: string): Promise<MatomoApi> {
    const token = await MatomoApi.raw('UsersManager.createAppSpecificTokenAuth', {
      userLogin: login,
      passwordConfirmation: password,
      description: `e2e ${RUN_ID} ${Date.now()}`,
    });
    if (!token || typeof token.value !== 'string') {
      throw new Error(`Could not create token for ${login}: ${JSON.stringify(token)}`);
    }
    return new MatomoApi(login, token.value);
  }

  static async superUser(): Promise<MatomoApi> {
    return MatomoApi.forUser(SUPERUSER.login, SUPERUSER.password);
  }

  static async raw(method: string, params: Params = {}): Promise<any> {
    const response = await fetch(`${MATOMO_URL}/index.php?module=API&format=json&method=${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(params),
    });
    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(`${method}: invalid JSON response (${response.status}): ${text.slice(0, 500)}`);
    }
    if (data && data.result === 'error') {
      throw new ApiError(data.message);
    }
    return data;
  }

  call(method: string, params: Params = {}): Promise<any> {
    return MatomoApi.raw(method, { ...params, token_auth: this.tokenAuth });
  }

  /** Calls an API method whose response is not JSON, e.g. a rendered report. */
  fetchRaw(method: string, params: Params = {}): Promise<Response> {
    return fetch(`${MATOMO_URL}/index.php?module=API&method=${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({ ...params, token_auth: this.tokenAuth }),
    });
  }

  /** Returns the error message of a call that is expected to fail. */
  async expectError(method: string, params: Params = {}): Promise<string> {
    try {
      const result = await this.call(method, params);
      throw new Error(`Expected ${method} to fail for ${this.login}, got ${JSON.stringify(result)}`);
    } catch (e) {
      if (e instanceof ApiError) return e.message;
      throw e;
    }
  }

  // ---- convenience helpers used to build fixtures ----

  async createUser(prefix: string, password = DEFAULT_PASSWORD): Promise<string> {
    const login = `${prefix}_${RUN_ID}`;
    await this.call('UsersManager.addUser', {
      userLogin: login,
      password,
      email: `${login}@example.org`,
      passwordConfirmation: SUPERUSER.password,
    });
    return login;
  }

  async createSite(name: string): Promise<number> {
    const result = await this.call('SitesManager.addSite', {
      siteName: `${name} ${RUN_ID}`,
      urls: `https://${name.toLowerCase().replace(/\W+/g, '-')}-${RUN_ID}.example.org`,
    });
    return Number(result.value);
  }

  async createGroup(prefix: string): Promise<{ idGroup: number; name: string }> {
    return this.call('GroupPermissions.createGroup', { groupName: `${prefix} ${RUN_ID}` });
  }

  async addMembers(idGroup: number, logins: string[]): Promise<void> {
    for (const login of logins) {
      await this.call('GroupPermissions.addUserToGroup', { idGroup, login });
    }
  }

  async setGroupAccess(groupName: string, access: string, idSites: number | string): Promise<void> {
    await this.call('GroupPermissions.setGroupAccess', { name: groupName, access, idSites: String(idSites) });
  }

  async setUserAccess(login: string, access: string, idSites: number | string): Promise<void> {
    await this.call('UsersManager.setUserAccess', {
      userLogin: login,
      access,
      idSites: String(idSites),
      passwordConfirmation: SUPERUSER.password,
    });
  }

  async deleteSite(idSite: number): Promise<void> {
    await this.call('SitesManager.deleteSite', { idSite, passwordConfirmation: SUPERUSER.password });
  }

  async deleteUser(login: string): Promise<void> {
    await this.call('UsersManager.deleteUser', { userLogin: login, passwordConfirmation: SUPERUSER.password });
  }

  async groupAccess(idSite: number): Promise<Record<string, string>> {
    return this.call('GroupPermissions.getGroupAccessFromSite', { idSite });
  }

  async groupByName(name: string): Promise<{ idGroup: number; name: string } | undefined> {
    const groups: Array<{ idGroup: number; name: string }> = await this.call('GroupPermissions.getAllGroups', { filter_limit: -1 });
    return groups.find((g) => g.name === name);
  }

  async members(idGroup: number): Promise<string[]> {
    const rows: Array<{ login: string }> = await this.call('GroupPermissions.getMembersOfGroup', { idGroup, filter_limit: -1 });
    return rows.map((r) => r.login).sort();
  }
}
