/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import businessPartner from './businessPartner.ts'
import displayType from './displayType.ts'
import product from './product.ts'
import productAttribute from './productAttribute'
import warehouseLocator from './warehouseLocator'
import locationsAddress from './locationsAddress'
import invoice from './invoice'
import order from './order.ts'
import payment from './payment.ts'

export default {
  businessPartner,
  displayType,
  field: 'Field',
  info: 'Information',
  calculator: 'Calculator',
  preference: 'Preference',
  logsField: 'Field Change Log',
  logsFieldEmpty: 'The field is still unchanged',
  contextInfo: 'Context Info',
  coordination: 'Coordinates',
  container: {
    help: 'Help',
    defaultValue: 'Default Value',
    description: 'Description'
  },
  inactiveRecordNoSelect: 'Inactive record cannot be selected',
  product,
  productAttribute,
  warehouseLocator,
  locationsAddress,
  invoice,
  payment,
  order,
  to: 'To'
}
