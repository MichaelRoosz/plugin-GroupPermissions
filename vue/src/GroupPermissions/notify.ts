/*!
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

import { Matomo, NotificationsStore, translate } from 'CoreHome';

/**
 * Shows a success toast. Notifications are rendered as (sanitized) HTML, so the values
 * inserted into the translation (group, user and website names) are escaped.
 */
export function notifySuccess(id: string, translationKey: string, ...values: string[]): void {
  NotificationsStore.show({
    message: translate(translationKey, ...values.map((v) => Matomo.helper.htmlEntities(v))),
    context: 'success',
    type: 'toast',
    id,
  });
}
