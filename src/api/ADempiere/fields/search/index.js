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

// Get Instance for connection
import { request } from '@/utils/ADempiere/request'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

// Constants
import { ROWS_OF_RECORDS_BY_PAGE } from '@/utils/ADempiere/tableUtils'

export function requestGridGeneralInfo({
  contextAttributes,
  filters = [],
  fieldId,
  processParameterId,
  browseFieldId,
  //
  // referenceUuid,
  searchValue,
  //
  tableName,
  columnName,
  columnId,
  //
  pageToken,
  pageSize = ROWS_OF_RECORDS_BY_PAGE,
  isWithoutValidation
}) {
  // filters = filters.map(attribute => {
  //   return {
  //     column_name: attribute.columnName,
  //     operator: attribute.operator,
  //     value: attribute.value
  //   }
  // })

  let url = 'fields/searchs'
  switch (true) {
    case !isEmptyValue(fieldId):
      url = `/fields/searchs/field/${fieldId}`
      break
    case !isEmptyValue(processParameterId):
      url = `/fields/searchs/parameter/${processParameterId}`
      break
    case !isEmptyValue(browseFieldId):
      url = `/fields/searchs/query-criteria/${browseFieldId}`
      break
    case !isEmptyValue(columnId):
      url = `/fields/searchs/column/${columnId}`
      break
    case (!isEmptyValue(tableName) && !isEmptyValue(columnName)):
      url = `/fields/searchs/${tableName}/${columnName}`
      break
  }

  return request({
    url,
    method: 'get',
    params: {
      context_attributes: contextAttributes,
      is_without_validation: isWithoutValidation,
      is_only_active_records: true,
      filters,
      //
      // reference_id: reference_id,
      search_value: searchValue,
      // Page Data
      page_token: pageToken,
      page_size: pageSize
    }
  })
}
