/*!
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

export interface Group {
  idGroup: number;
  name: string;
}

export interface GroupOverview extends Group {
  memberCount: number;
  siteCount: number;
}

export interface SiteAccess {
  idSite: number;
  name: string;
  access: string;
  capabilities: string[];
}

export interface MatomoUser {
  login: string;
  email: string;
  invite_status?: string|number;
}

export interface SelectedSite {
  id: number|string;
  name: string;
}

export interface RoleOption {
  key: string;
  value: string;
  description?: string;
}


export interface GroupSitePermission extends Group {
  access: string;
  capabilities: string[];
}

export interface CapabilityOption {
  id: string;
  name: string;
  description: string;
  category: string;
  includedInRoles: string[];
}

export interface AutoAccessRule {
  idRule: number;
  matchType: string;
  pattern: string;
  access: string;
  capabilities: string[];
}
