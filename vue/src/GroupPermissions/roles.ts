/*!
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { AjaxHelper, translate } from 'CoreHome';
import { RoleOption } from './types';

interface Role {
  id: string;
  name: string;
  description: string;
}

let rolesPromise: Promise<RoleOption[]>|null = null;

/**
 * Roles a group can get (view, write, admin, ... as provided by Matomo), loaded once per page.
 */
export function loadRoles(): Promise<RoleOption[]> {
  if (!rolesPromise) {
    rolesPromise = AjaxHelper.fetch<Role[]>({ method: 'UsersManager.getAvailableRoles' })
      .then((roles) => roles.map((role) => ({
        key: role.id,
        value: role.name,
        description: role.description,
      })))
      .catch((e) => {
        rolesPromise = null;
        throw e;
      });
  }
  return rolesPromise;
}

export function noAccessOption(): RoleOption {
  return { key: 'noaccess', value: translate('UsersManager_PrivNone') };
}

export function roleName(roles: RoleOption[], access: string): string {
  if (access === 'noaccess') {
    return noAccessOption().value;
  }
  const role = roles.find((r) => r.key === access);
  return role ? role.value : access;
}
