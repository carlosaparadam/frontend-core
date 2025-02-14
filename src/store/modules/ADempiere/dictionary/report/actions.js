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

import router from '@/router'
import store from '@/store'

// API Request Methods
import { requestProcessMetadata as requestReportMetadata } from '@/api/ADempiere/dictionary/process'

// Constants
import {
  sharedLink
} from '@/utils/ADempiere/constants/actionsMenuList.js'

// Utils and Helper Methods
import { showNotification } from '@/utils/ADempiere/notification.js'
import {
  containerManager
} from '@/utils/ADempiere/dictionary/report'
import {
  runReport,
  runReportAs,
  changeParameters,
  clearParameters,
  runReportAsPrintFormat,
  runReportAsView
} from '@/utils/ADempiere/dictionary/report/actionsMenu.ts'
import { generateProcess as generateReport, isDisplayedField } from '@/utils/ADempiere/dictionary/process.js'
import { isSalesTransaction } from '@/utils/ADempiere/contextUtils'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default {
  addReportToList({ commit, dispatch }, reportResponse) {
    return new Promise(resolve => {
      commit('addReportToList', reportResponse)

      dispatch('setReportDefaultValues', {
        containerUuid: reportResponse.uuid,
        fieldsList: reportResponse.fieldsList
      })

      dispatch('setReportActionsMenu', {
        reportUuid: reportResponse.uuid
      })

      resolve(reportResponse)
    })
  },

  /**
   * Get report dictionary definition
   * @param {string} uuid of dictionary
   */
  getReportDefinitionFromServer({ dispatch, getters, rootGetters }, {
    id,
    isLegacyReport = false,
    tableName
  }) {
    return new Promise((resolve, reject) => {
      const language = rootGetters['getCurrentLanguage']
      const dictionaryCode = rootGetters['user/getDictionaryCode']

      requestReportMetadata({
        id,
        language,
        dictionaryCode
      })
        .then(async reportResponse => {
          const { uuid } = reportResponse
          const { processDefinition: reportDefinition } = generateReport({
            isLegacyReport,
            processToGenerate: reportResponse
          })

          const {
            type
          } = router.app._route.meta
          if (type === 'window') {
            await dispatch('listPrintFormatWindow', {
              tableName,
              reportId: reportDefinition.internal_id
            })
          } else {
            await dispatch('listPrintFormatsFromServer', {
              reportId: reportDefinition.internal_id
            })
          }

          dispatch('addReportToList', reportDefinition)

          resolve(reportDefinition)

          // exist dialog if is process associated
          const storedModalDialog = getters.getModalDialogManager({
            containerUuid: uuid
          })
          if (isEmptyValue(storedModalDialog)) {
            dispatch('setModalDialog', {
              containerUuid: uuid,
              title: reportDefinition.name,
              doneMethod: () => {
                dispatch('startReport', {
                  containerUuid: reportDefinition.uuid
                })
              },
              loadData: ({ containerUuid }) => {
                const reportDefinition = rootGetters.getStoredReport(containerUuid)
                if (!isEmptyValue(reportDefinition)) {
                  return Promise.resolve(reportDefinition)
                }
                return dispatch('getReportDefinitionFromServer', {
                  id
                })
              },
              // TODO: Change to string and import dynamic in component
              componentPath: () => import('@/components/ADempiere/PanelDefinition/index.vue'),
              isShowed: false
            })
          }
        })
        .catch(error => {
          showNotification({
            type: 'error',
            title: 'error',
            message: 'requestError'
          })
          store.dispatch('tagsView/delView', router.app._route)
            .then(() => {
              router.push('/', () => {})
            })
          reject(error)
        })
    })
  },

  /**
   * Set actions menu to report
   * @param {number} reportId
   */
  setReportActionsMenu({ commit, getters, rootGetters }, {
    reportUuid
  }) {
    const reportDefinition = getters.getStoredReport(reportUuid)
    const reportId = reportDefinition.internal_id
    // const containerUuid = reportDefinition.uuid

    const actionsList = []

    const actionGenerateReport = {
      ...runReport
      // containerId: reportId
    }
    actionsList.push(actionGenerateReport)

    // destruct to avoid deleting the reference to the original variable and to avoid mutating
    const actionExportType = { ...runReportAs }
    const runTypeChilds = []
    if (!isEmptyValue(reportDefinition.reportExportTypes)) {
      reportDefinition.reportExportTypes.forEach(reportType => {
        // push values
        runTypeChilds.push({
          ...reportType,
          icon: 'el-icon-document',
          enabled: true,
          svg: false,
          actionName: 'runReportAs',
          uuid: null,
          runReportAs: ({ root, containerUuid }) => {
            store.dispatch('buildReport', {
              containerUuid,
              reportType: reportType.type
            })
          }
        })
      })

      actionExportType.childs = runTypeChilds
    }
    actionsList.push(actionExportType)

    // change parameters to report viewer
    actionsList.push(changeParameters)
    actionsList.push(clearParameters)

    // destruct to avoid deleting the reference to the original variable and to avoid mutating
    const actionPrintFormat = {
      ...runReportAsPrintFormat,
      containerId: reportId
    }
    const printFormats = rootGetters.getPrintFormatsList(reportId)
    if (!isEmptyValue(printFormats)) {
      const printFormatChilds = []
      printFormats.forEach(printFormat => {
        printFormatChilds.push({
          ...printFormat,
          icon: 'el-icon-document',
          enabled: true,
          svg: false,
          actionName: 'runReportAsPrintFormat',
          uuid: null,
          runReportAsPrintFormat: ({
            instanceUuid,
            root,
            containerUuid
          }) => {
            store.dispatch('buildReport', {
              containerUuid,
              instanceUuid,
              action: printFormat,
              printFormatId: printFormat.id
            })
          }
        })
      })

      actionPrintFormat.childs = printFormatChilds
    }
    actionsList.push(actionPrintFormat)

    // destruct to avoid deleting the reference to the original variable and to avoid mutating
    const actionView = {
      ...runReportAsView,
      containerId: reportId
    }
    const reportsView = rootGetters.getReportViewList(reportId)
    if (!isEmptyValue(reportsView)) {
      const printFormatChilds = []
      reportsView.forEach(reportView => {
        printFormatChilds.push({
          ...reportView,
          icon: 'el-icon-document',
          enabled: true,
          svg: false,
          actionName: 'runReportView',
          uuid: null,
          runReportView: ({ root, containerUuid }) => {
            const currentRoute = router.app._route
            let instanceUuid = 'not-empty'
            if (currentRoute.params && currentRoute.params.instanceUuid) {
              instanceUuid = currentRoute.params.instanceUuid
            }

            store.dispatch('buildReport', {
              containerUuid,
              action: reportView,
              instanceUuid,
              reportViewId: reportView.id
            })
          }
        })
      })

      actionView.childs = printFormatChilds
    }
    actionsList.push(actionView)

    // action shared link
    actionsList.push(sharedLink)

    commit('setActionMenu', {
      containerUuid: reportDefinition.uuid,
      actionsList
    })
  },

  /**
   * Used by components/fields/filterFields
   * @param {string} containerUuid
   * @param {string} groupField
   * @param {array} fieldsShowed
   * @param {array} fieldsList
   */
  changeReportFieldShowedFromUser({ commit, getters }, {
    containerUuid,
    fieldsShowed = [],
    fieldsList = []
  }) {
    if (isEmptyValue(fieldsList)) {
      fieldsList = getters.getStoredFieldsFromReport(containerUuid)
    }

    fieldsList.forEach(itemField => {
      const { columnName } = itemField

      const isShowedFromUser = fieldsShowed.includes(columnName)
      if (itemField.isShowedFromUser === isShowedFromUser) {
        // no to mutate the state unnecessarily
        return
      }

      if (!isDisplayedField(itemField)) {
        // is hidden by logic not change showed from user
        return
      }

      commit('changeReportFieldAttribute', {
        field: itemField,
        attributeName: 'isShowedFromUser',
        attributeValue: isShowedFromUser
      })
    })
  },

  /**
   * Set default values to panel
   * @param {string}  containerUuid
   * @param {array}  fieldsList
   */
  setReportDefaultValues({ commit, dispatch, getters }, {
    containerUuid,
    fieldsList = []
  }) {
    return new Promise(resolve => {
      if (isEmptyValue(fieldsList)) {
        fieldsList = getters.getStoredFieldsFromReport(containerUuid)
      }

      const isSalesTransactionContext = isSalesTransaction({
        containerUuid,
        isRecord: false
      })
      const defaultAttributes = getters.getParsedDefaultValues({
        containerUuid,
        isSOTrxDictionary: isSalesTransactionContext,
        fieldsList
      })

      dispatch('updateValuesOfContainer', {
        containerUuid,
        isOverWriteParent: true,
        attributes: defaultAttributes
      })

      // clear last parameters with report generated
      commit('setReportGenerated', {
        containerUuid
      })

      fieldsList.forEach(field => {
        // activate logics
        dispatch('changeDependentFieldsList', {
          field,
          fieldsList,
          containerManager
        })
      })

      resolve(defaultAttributes)
    })
  }

}
