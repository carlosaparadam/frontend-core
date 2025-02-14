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

import language from '@/lang'

// Constants
import { CLIENT, ORGANIZATION, CURRENCY, UOM, WAREHOUSE } from '@/utils/ADempiere/constants/systemColumns'
import { title } from '@/settings'
import { config } from '@/utils/ADempiere/config'
import { ACCOUNTING_CONTEXT_PREFIX, GLOBAL_CONTEXT_PREFIX } from '@/utils/ADempiere/contextUtils'

// API Request Methods
import {
  requestUserActivity
} from '@/api/ADempiere/logs/index.ts'
import {
  requestLogin,
  requestLogout,
  requestRolesList,
  requestChangeRole,
  organizationsListRequest,
  warehousesListRequest,
  requestSessionInfo,
  loginAuthentication,
  setSessionAttribute,
  requestUserInfoFromSession
} from '@/api/ADempiere/security/index.ts'
import {
  systemInfo,
  systemInfoDictionary,
  systemInfoS3,
  systemInfoReportEngine
} from '@/api/ADempiere/common/index.ts'
import { getCurrencyPrecision, getUnitOfMeasure } from '@/api/ADempiere/system-core.js'

// Utils and Helper Methods
import { resetRouter } from '@/router'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'
import { pathImageWindows } from '@/utils/ADempiere/resource'
import { camelizeObjectKeys } from '@/utils/ADempiere/transformObject.js'
import { convertObjectToKeyValue } from '@/utils/ADempiere/valueFormat.js'
import {
  getToken, setToken, removeToken,
  setCurrentClient,
  getCurrentRole, setCurrentRole, removeCurrentRole,
  getCurrentOrganization, setCurrentOrganization, removeCurrentOrganization,
  getCurrentWarehouse, setCurrentWarehouse, removeCurrentWarehouse
} from '@/utils/auth'
// Constants
import { COLUMN_NAME, TABLE_NAME_CLIENT, TABLE_NAME_USER } from '@/utils/ADempiere/constants/resoucer.ts'

const state = {
  token: getToken(),
  name: '',
  userId: -1,
  avatar: '',
  introduction: '',
  role: {}, // info current role
  rolesList: [],
  roles: [],
  userInfo: {},
  organizationsList: [],
  organization: {},
  currentOrganizationId: 0,
  warehousesList: [],
  warehouse: {},
  isSession: false,
  sessionInfo: {},
  corporateBrandingImage: '',
  activityLogs: [],
  systemInfo: {},
  dictionary: {},
  s3Version: {},
  precisionContext: {},
  precisionUOMContext: {},
  reportEngineVersion: {},
  logoUrl: 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4',
  userImageUrl: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ROLES_LIST: (state, payload) => {
    state.rolesList = payload
  },
  SET_ORGANIZATIONS_LIST: (state, payload) => {
    state.organizationsList = payload
  },
  SET_CURRENT_ORGANIZATION_ID: (state, organizationId) => {
    state.currentOrganizationId = organizationId
  },
  SET_ORGANIZATION: (state, organization) => {
    state.organization = organization
    if (organization) {
      state.corporateBrandingImage = organization.corporateBrandingImage
    }
  },
  SET_WAREHOUSES_LIST: (state, payload) => {
    state.warehousesList = payload
  },
  SET_WAREHOUSE: (state, warehouse) => {
    state.warehouse = warehouse
  },
  SET_ROLE: (state, role) => {
    state.role = role
  },
  SET_USER: (state, payload) => {
    state.userInfo = payload
  },
  SET_USER_ID: (state, payload) => {
    state.userId = payload
  },
  setIsSession(state, payload) {
    state.isSession = payload
  },
  setSessionInfo(state, payload) {
    state.sessionInfo = payload
  },
  setActivityLogs(state, logs) {
    state.activityLogs = logs
  },
  setSystem(state, info) {
    state.systemInfo = info
  },
  setSystemDictionary(state, info) {
    state.dictionary = info
  },
  setSystemS3(state, info) {
    state.s3Version = info
  },
  setSystemReportEngine(state, info) {
    state.reportEngineVersion = info
  },
  setCurrencyPrecision(state, precision) {
    state.precisionContext = precision
  },
  setUOMPrecision(state, precision) {
    state.precisionUOMContext = precision
  },
  setLogo(state, url) {
    state.logoUrl = url
  },
  setUserImage(state, url) {
    state.userImageUrl = url
  }
}

const actions = {
  // user login
  login({ commit }, {
    userName,
    password,
    roleId,
    organizationId,
    warehouseId,
    token
  }) {
    return new Promise((resolve, reject) => {
      requestLogin({
        userName,
        password,
        roleId,
        organizationId,
        warehouseId,
        token
      })
        .then(response => {
          const { token } = response
          commit('SET_TOKEN', token)
          setToken(token)
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  loginOpenId({ commit }, {
    code,
    state
  }) {
    return new Promise((resolve, reject) => {
      loginAuthentication({
        code,
        state
      })
        .then(response => {
          const { token } = response
          commit('SET_TOKEN', token)
          setToken(token)
          resolve(token)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  /**
   * Get session info
   */
  getSessionInfo({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      requestSessionInfo()
        .then(async sessionInfo => {
          const {
            id,
            name,
            userInfo,
            processed,
            defaultContext
          } = sessionInfo
          dispatch('system')
          dispatch('systemDictionary')
          dispatch('systemS3')
          dispatch('systemReportEngine')
          dispatch('currencyPrecision', {
            id: defaultContext[ACCOUNTING_CONTEXT_PREFIX + CURRENCY]
          })
          dispatch('unitOfMeasurePrecision', {
            id: defaultContext[GLOBAL_CONTEXT_PREFIX + UOM]
          })
          commit('setIsSession', true)
          commit('setSessionInfo', {
            id,
            name,
            processed
          })

          commit('SET_NAME', name)
          commit('SET_USER', userInfo)
          commit('SET_USER_ID', userInfo.id)

          const avatar = userInfo.image
          if (!isEmptyValue(avatar)) {
            // 108=window User
            // 11/client/window/108/ad_user/101/logo_id/2024-04-0811-55.png
            const clientId = defaultContext[`#${CLIENT}`]
            const newLogoPath = `${clientId}/client/window/108/ad_user/${userInfo.id}/logo_id/${userInfo.image}`
            commit('SET_AVATAR', newLogoPath)
          }

          // TODO: Check decimals Number as String '0.123'
          // set multiple context
          dispatch('setMultiplePreference', {
            values: defaultContext
          }, {
            root: true
          })

          const sessionResponse = {
            name: sessionInfo.name,
            defaultContext: defaultContext
          }

          const { role } = sessionInfo
          commit('SET_ROLE', role)
          setCurrentRole(role.id)
          setCurrentClient(role.client.id)
          // const currentOrganizationSession = defaultContext.find(context => {
          //   return context.key === defaultContext[`#${ORGANIZATION}`]
          // })
          const sessionOrganizationId = defaultContext[`#${ORGANIZATION}`]
          commit('SET_CURRENT_ORGANIZATION_ID', sessionOrganizationId)
          setCurrentOrganization(sessionOrganizationId)

          const sessionWarehouseId = defaultContext[`#${WAREHOUSE}`]
          // commit('SET_WAREHOUSE', sessionWarehouseId)
          setCurrentWarehouse(sessionWarehouseId)

          // wait to establish the client and organization to generate the menu
          await dispatch('getOrganizationsListFromServer', {
            roleId: role.id,
            organizationId: sessionOrganizationId
          })

          resolve(sessionResponse)

          commit('setSystemDefinition', sessionInfo, {
            root: true
          })

          // get country definition of context session
          dispatch('getCountryDefinition', {
            id: sessionInfo.countryId
          }, {
            root: true
          })

          dispatch('getRolesListFromServer')
            .finally(() => {
              dispatch('searchImageLogoOnServer')
              dispatch('searchImageUserOnServer', {
                userInfo
              })
            })
        })
        .catch(error => {
          console.warn(`Error ${error.code} getting context session: ${error.message}.`)
          reject(error)
        })
    })
  },

  /**
   * Get Currency
   */
  currencyPrecision({ commit }, {
    id
  }) {
    return new Promise((resolve, reject) => {
      getCurrencyPrecision({
        id
      })
        .then(response => {
          commit('setCurrencyPrecision', response)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  /**
   * Get Unit Of Measure
   */
  unitOfMeasurePrecision({ commit }, {
    id
  }) {
    return new Promise((resolve, reject) => {
      getUnitOfMeasure({
        id
      })
        .then(response => {
          commit('setUOMPrecision', response)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  /**
   * Get user info
   */
  getUserInfoFromSession({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      requestUserInfoFromSession().then(responseGetInfo => {
        if (isEmptyValue(responseGetInfo)) {
          reject({
            code: 0,
            message: 'Verification failed, please Login again.'
          })
        }
        // if (isEmptyValue(state.role)) {
        //   const role = responseGetInfo.rolesList.find(itemRole => {
        //     return itemRole.id === getCurrentRole()
        //   })
        //   if (!isEmptyValue(role)) {
        //     commit('SET_ROLE', role)
        //   }
        // }

        dispatch('getRolesListFromServer')

        const avatar = responseGetInfo.image
        commit('SET_AVATAR', avatar)

        resolve({
          ...responseGetInfo,
          avatar
        })
      }).catch(error => {
        console.warn(`Error ${error.code} getting user info value: ${error.message}.`)
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, rootState, dispatch }) {
    return new Promise((resolve, reject) => {
      commit('setIsSession', false)
      rootState['pointOfSales/point/index'].showPOSCollection = false
      // reset visited views and cached views
      // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      dispatch('tagsView/delAllViews', null, { root: true })

      requestLogout().catch(error => {
        console.warn(error)
      }).finally(() => {
        dispatch('resetStateBusinessData', null, {
          root: true
        })

        // clear sesion cookies
        removeCurrentRole()
        removeCurrentOrganization()
        removeCurrentWarehouse()
        resetRouter()

        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()

        resolve()
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  getRolesListFromServer({ commit }) {
    return new Promise((resolve, reject) => {
      requestRolesList()
        .then(rolesList => {
          // roles must be a non-empty array
          if (isEmptyValue(rolesList)) {
            reject({
              code: 0,
              message: 'getInfo: roles must be a non-null array!'
            })
          }

          // set current role
          if (isEmptyValue(state.role)) {
            let role
            const roleSession = getCurrentRole()
            if (!isEmptyValue(roleSession)) {
              role = rolesList.find(itemRole => {
                return itemRole.id === roleSession
              })
            }
            if (isEmptyValue(role)) {
              role = rolesList.at(0)
            }

            if (!isEmptyValue(role)) {
              commit('SET_ROLE', role)
            }
          }

          commit('SET_ROLES_LIST', rolesList)

          resolve(rolesList)

          const rolesName = rolesList.map(rolItem => {
            return rolItem.name
          })
          commit('SET_ROLES', rolesName)
        })
    })
  },

  /**
   * Get list of organizations
   * @param {number} roleId
   * @param {number} organizationId
   * @returns
   */
  getOrganizationsListFromServer({ commit, dispatch, getters }, {
    roleId,
    organizationId
  }) {
    if (isEmptyValue(roleId)) {
      roleId = getCurrentRole()
    }
    if (isEmptyValue(organizationId)) {
      organizationId = getters.getCurrentOrgId
    }

    return organizationsListRequest({ roleId })
      .then(response => {
        let organization = response.organizationsList.find(orgItem => {
          return orgItem.id === organizationId
        })
        if (isEmptyValue(organization)) {
          organization = response.organizationsList.at(0)
        }
        commit('SET_ORGANIZATIONS_LIST', response.organizationsList)
        const { id } = organization
        setCurrentOrganization(id)
        commit('SET_ORGANIZATION', organization)
        commit('SET_CURRENT_ORGANIZATION_ID', id)
        // commit('setPreferenceContext', {
        //   columnName: `#${ORGANIZATION}`,
        //   value: organization.id
        // }, {
        //   root: true
        // })

        dispatch('getWarehousesList', {
          organizationId: organization.id
        })
      })
      .catch(error => {
        console.warn(`Error ${error.code} getting Organizations list: ${error.message}.`)
      })
  },

  changeOrganization({ commit, dispatch, getters }, {
    organizationId,
    isCloseAllViews = true
  }) {
    // TODO: Check if there are no tagViews in the new routes to close them, and
    // if they exist, reload with the new route using name (uuid)
    dispatch('tagsView/setCustomTagView', {
      isCloseAllViews
    }, {
      root: true
    })

    const isSameOrganization = organizationId === getCurrentOrganization()

    return requestChangeRole({
      roleId: getCurrentRole(),
      organizationId
    })
      .then(response => {
        const { token } = response
        commit('SET_TOKEN', token)
        setToken(token)

        const organizationsList = getters.getOrganizations
        let organization = organizationsList.find(org => {
          return org.id === organizationId
        })
        if (isEmptyValue(organization) && !isEmptyValue(organizationsList)) {
          organization = organizationsList.at(0)
        }
        const { id } = organization
        setCurrentOrganization(id)

        commit('SET_ORGANIZATION', organization)
        commit('SET_CURRENT_ORGANIZATION_ID', id)
        commit('setPreferenceContext', {
          columnName: `#${ORGANIZATION}`,
          value: id
        }, {
          root: true
        })

        // Update user info and context associated with session
        // dispatch('getSessionInfo', tokenSession)
        // refresh warehouses
        if (!isSameOrganization) {
          dispatch('getWarehousesList', {
            organizationId: id
          })
        }

        showMessage({
          message: language.t('notifications.successChangeRole'),
          type: 'success',
          showClose: true
        })
      })
      .catch(error => {
        let messageError = error
        if (error.message) {
          messageError = error.message
        }
        showMessage({
          message: messageError,
          type: 'error',
          showClose: true
        })
        console.warn(`Error change role: ${messageError}. Code: ${error.code}.`)
      })
      .finally(() => {
        dispatch('permission/sendRequestMenu', null, {
          root: true
        })

        dispatch('resetStateBusinessData', null, {
          root: true
        })
        // location.href = '/'
      })
  },

  getWarehousesList({ commit, dispatch }, {
    organizationId
  }) {
    if (isEmptyValue(organizationId)) {
      organizationId = getCurrentOrganization()
    }
    if (isEmptyValue(organizationId)) {
      dispatch('changeWarehouse', {
        warehouseId: -1
      })
      commit('SET_WAREHOUSE', undefined)
      commit('setPreferenceContext', {
        columnName: `#${WAREHOUSE}`,
        value: -1
      }, {
        root: true
      })
      removeCurrentWarehouse()
      return
    }

    return warehousesListRequest({
      organizationId
    })
      .then(response => {
        const { warehouses } = response
        commit('SET_WAREHOUSES_LIST', warehouses)
        let warehouse = warehouses.find(warehouseItem => {
          return warehouseItem.id === getCurrentWarehouse()
        })
        if (isEmptyValue(warehouse) && !isEmptyValue(warehouses)) {
          warehouse = warehouses.at(0)
        }

        let warehouseId = -1
        if (!isEmptyValue(warehouse)) {
          warehouseId = warehouse.id
        }

        if (isEmptyValue(warehouseId)) {
          removeCurrentWarehouse()
        }
        const currentWarehouseId = getCurrentWarehouse()
        if (warehouseId !== currentWarehouseId) {
          dispatch('changeWarehouse', {
            warehouseId
          })
        }

        setCurrentWarehouse(warehouseId)
        commit('SET_WAREHOUSE', warehouse)
        commit('setPreferenceContext', {
          columnName: `#${WAREHOUSE}`,
          value: warehouseId
        }, {
          root: true
        })
      })
      .catch(error => {
        console.warn(`Error ${error.code} getting Warehouses list: ${error.message}.`)
      })
  },

  changeWarehouse({ commit, state }, {
    warehouseId
  }) {
    setCurrentWarehouse(warehouseId)

    const currentWarehouse = state.warehousesList.find(warehouseItem => {
      return warehouseItem.id === warehouseId
    })
    commit('SET_WAREHOUSE', currentWarehouse)

    commit('setPreferenceContext', {
      columnName: `#${WAREHOUSE}`,
      value: currentWarehouse.id
    }, {
      root: true
    })
    setSessionAttribute({
      warehouseId: currentWarehouse.id
    })
      .then(response => {
        const { token } = response
        commit('SET_TOKEN', token)
        setToken(token)
        // location.reload()
      })
  },

  // dynamically modify permissions
  changeRole({ commit, dispatch }, {
    roleId,
    organizationId,
    warehouseId,
    isCloseAllViews = true
  }) {
    dispatch('tagsView/setCustomTagView', {
      isCloseAllViews
    }, {
      root: true
    })

    return requestChangeRole({
      roleId,
      organizationId,
      warehouseId
    })
      .then(response => {
        const { token } = response
        commit('SET_TOKEN', token)
        setToken(token)

        // commit('SET_ROLE', role)
        setCurrentRole(roleId)

        removeCurrentOrganization()
        removeCurrentWarehouse()

        // Update user info and context associated with session
        // dispatch('getSessionInfo', uuid)

        dispatch('getSessionInfo')

        showMessage({
          message: language.t('notifications.successChangeRole'),
          type: 'success',
          showClose: true
        })
        return roleId
      })
      .catch(error => {
        showMessage({
          message: error.message,
          type: 'error',
          showClose: true
        })
        console.warn(`Error change role: ${error.message}. Code: ${error.code}.`)
      })
      .finally(() => {
        dispatch('permission/sendRequestMenu', null, {
          root: true
        })

        dispatch('resetStateBusinessData', null, {
          root: true
        })
      })
  },

  loadingActivitylogsFromServer({ commit }, date) {
    return new Promise(resolve => {
      requestUserActivity({
        date
      })
        .then(response => {
          const { records } = response
          const activitylogs = response.records.map((logs, index) => {
            const userActivityType = logs.user_activity_type
            let processLog, entityLog
            switch (userActivityType) {
              case 'ENTITY_LOG':
                entityLog = {
                  ...camelizeObjectKeys(logs.entity_log),
                  changeLogs: logs.entity_log.change_logs
                }
                break
              case 'PROCESS_LOG':
                processLog = {
                  ...camelizeObjectKeys(logs.process_log),
                  parameters: convertObjectToKeyValue(logs.process_log.parameters)
                }
                break
            }
            return {
              ...camelizeObjectKeys(logs),
              entityLog,
              processLog,
              show: true,
              index
            }
          })
          commit('setActivityLogs', activitylogs)
          resolve(records)
        })
        .catch(error => {
          resolve([])
          commit('setActivityLogs', [])
          console.warn(`Error getting List User Activity: ${error.message}. Code: ${error.code}.`)
        })
    })
  },
  system({ commit }) {
    return new Promise(resolve => {
      systemInfo()
        .then(response => {
          if (isEmptyValue(response)) {
            resolve()
            return
          }
          const info = camelizeObjectKeys(response)
          let systemName = title
          if (!isEmptyValue(info.name)) {
            systemName = info.name
          }
          commit('setSystem', {
            ...info,
            name: systemName
          })

          resolve(info)
        })
        .catch(error => {
          commit('setSystem', {})
          console.warn(`Error getting System Info: ${error.message}. Code: ${error.code}.`)
          resolve({})
        })
    })
  },
  systemDictionary({ commit }) {
    return new Promise(resolve => {
      let systemInfo = {
        version: '0.0.1'
      }
      systemInfoDictionary()
        .then(response => {
          if (!isEmptyValue(response) && !isEmptyValue(response.version)) {
            systemInfo = response
          }
          commit('setSystemDictionary', {
            ...systemInfo,
            ...response
          })
          resolve(systemInfo)
        })
        .catch(error => {
          commit('setSystemDictionary', {
            ...systemInfo
          })
          console.warn(`Error getting System Info: ${error.message}. Code: ${error.code}.`)
          resolve(systemInfo)
        })
    })
  },

  systemS3({ commit }) {
    return new Promise(resolve => {
      let systemInfo = {
        version: '0.0.1'
      }
      systemInfoS3()
        .then(response => {
          if (!isEmptyValue(response)) {
            systemInfo = {
              ...systemInfo,
              ...response
            }
          }
          commit('setSystemS3', systemInfo)
          resolve(systemInfo)
        })
        .catch(error => {
          commit('setSystemS3', systemInfo)
          console.warn(`Error getting System Info: ${error.message}. Code: ${error.code}.`)
          resolve(systemInfo)
        })
    })
  },
  systemReportEngine({ commit }) {
    return new Promise(resolve => {
      let systemInfo = {
        version: '0.0.1'
      }
      systemInfoReportEngine()
        .then(response => {
          if (!isEmptyValue(response)) {
            const { main_version: version } = response
            systemInfo = {
              version
            }
          }
          commit('setSystemReportEngine', systemInfo)
          resolve(systemInfo)
        })
        .catch(error => {
          commit('setSystemReportEngine', systemInfo)
          console.warn(`Error getting System Info: ${error.message}. Code: ${error.code}.`)
          resolve(systemInfo)
        })
    })
  },
  searchImageLogoOnServer({ commit, getters }) {
    const { client } = getters.getRole
    const url = pathImageWindows({
      clientId: client.uuid,
      tableName: TABLE_NAME_CLIENT,
      recordId: client.id,
      columnName: COLUMN_NAME,
      resourceName: `${COLUMN_NAME}.png`
    })
    fetch(url)
      .then((responseImage) => {
        if (responseImage.ok) {
          commit('setLogo', url)
          return
        }
        commit('setLogo', 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4')
      })
  },
  async searchImageUserOnServer({ commit, getters }, {
    userInfo
  }) {
    // const { userInfo } = getters.userInfo
    const url = pathImageWindows({
      clientId: userInfo.client_uuid,
      tableName: TABLE_NAME_USER,
      recordId: userInfo.id,
      columnName: COLUMN_NAME,
      resourceName: `${COLUMN_NAME}.png`
    })
    try {
      fetch(url)
        .then((responseImage) => {
          if (responseImage.ok) {
            commit('setUserImage', url)
            return
          }
          commit('setUserImage', '')
        })
    } catch (error) {
      console.error('Error al validar la URL:', error)
    }
  }
}

const getters = {
  getIsSession: (state) => {
    return state.isSession
  },
  getOrganizations: (state) => {
    return state.organizationsList
  },
  getOrganization: (state) => {
    return state.organization
  },
  getCurrentOrgId: (state) => {
    return state.currentOrganizationId
  },
  getRoles: (state) => {
    return state.rolesList
  },
  // current role info
  getRole: (state) => {
    return state.role
  },
  getWarehouses: (state) => {
    return state.warehousesList
  },
  // TODO: Manage with vuex module to warehouse
  getWarehouse: (state) => {
    return state.warehouse
  },
  getUserId: (state) => {
    return state.userId
  },
  userInfo: (state) => {
    return state.userInfo
  },
  getUserAvatar: (state) => {
    if (isEmptyValue(state.avatar)) return ''
    return `${config.adempiere.api.url}resources/${state.avatar}`
  },
  // TODO: Manage with vuex module to personal lock
  getIsPersonalLock: (state) => {
    return state.role.isPersonalLock
  },
  getActivityLogs: (state) => {
    return state.activityLogs
  },
  getSystem: (state) => {
    return state.systemInfo
  },
  getDictionaryCode: (state) => {
    if (isEmptyValue(state.role)) {
      return ''
    }
    if (isEmptyValue(state.role.client)) {
      return ''
    }
    return state.role.client.dictionary_code
  },
  getDictionaryVersion: (state) => {
    return state.dictionary
  },
  getS3Version: (state) => {
    return state.s3Version
  },
  getReportEngineVersion: (state) => {
    return state.reportEngineVersion
  },
  getCurrencyPrecision: (state) => {
    return state.precisionContext
  },
  getUOMPrecision: (state) => {
    return state.precisionUOMContext
  },
  getLogoUrl: (state) => {
    return state.logoUrl
  },
  getUserUrl: (state) => {
    return state.userImageUrl
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
