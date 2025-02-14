<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <div
    v-shortkey="{ new: ['alt', 'n'], save: ['alt', 's'], undo: ['alt', 'z'] }"
    class="tab-manager-container"
    @shortkey="theAction"
  >
    <el-tabs
      ref="el-tabs-container"
      v-model="currentTab"
      class="el-tabs-container"
      type="border-card"
      style="width:100%;height: 100%;"
      @tab-click="handleClick"
    >
      <el-tab-pane
        v-for="(tabAttributes, key) in tabsList"
        :key="key"
        :label="tabAttributes.name"
        :name="String(key)"
        :tabuuid="tabAttributes.uuid"
        :tabindex="String(key)"
        lazy
        :disabled="isDisabledTab(key)"
        :style="tabStyle"
      >
        <tab-label
          slot="label"
          :is-active-tab="tabAttributes.uuid === tabUuid"
          :parent-uuid="parentUuid"
          :container-uuid="tabAttributes.uuid"
          :container-manager="containerManager"
        />
        <!-- Close table when clicking on group of fields -->
        <!-- <div
          v-if="isShowedTabs"
          @click="selectTab(tabsList[parseInt(currentTab)])"
        > -->
        <div
          style="display: contents;"
          @click="selectTab(tabsList[parseInt(currentTab)])"
        >
          <tab-panel
            id="tab-panel"
            :parent-uuid="parentUuid"
            :container-manager="containerManager"
            :tabs-list="tabsList"
            :all-tabs-list="allTabsList"
            :tab-uuid="tabUuid"
            :tab-attributes="tabAttributes"
            :actions-manager="actionsManager"
            :style="'height: 100% !important;'"
          />
        </div>
        <!-- </div> -->
      </el-tab-pane>
    </el-tabs>

    <div :style="sizeBadgeRight">
      <el-button
        v-if="isMobile"
        plain
        size="medium"
        type="primary"
        circle
        @click="openRecordLogs('getRecordLogs')"
      >
        <i
          class="el-icon-arrow-left"
        />
      </el-button>
      <el-button
        v-else
        type="primary"
        size="mini"
        circle
        @click="openRecordLogs('getRecordLogs')"
      >
        <svg-icon icon-class="tree-table" />
      </el-button>

      <el-badge v-show="showAttachmentAvailable && !isMobile" :value="countAttachment" class="item" type="primary">
        <el-button
          v-show="showAttachmentAvailable"
          type="primary"
          size="mini"
          circle
          style="margin: 0px"
          @click="openRecordLogs('recordAttachmentTab')"
        >
          <i class="el-icon-paperclip" />
        </el-button>
      </el-badge>

      <el-badge v-show="showReference && !isMobile" :value="countReference" class="item" type="primary">
        <el-button
          v-show="showReference"
          type="primary"
          size="mini"
          circle
          style="margin: 0px"
          @click="openRecordLogs('listReference')"
        >
          <i class="el-icon-zoom-in" />
        </el-button>
      </el-badge>
      <el-badge v-show="showDashboard && !isMobile" :value="countDashboard" class="item" type="primary">
        <el-button
          v-show="showDashboard"
          type="primary"
          size="mini"
          circle
          style="margin: 0px"
          @click="openRecordLogs('listDashboard')"
        >
          <svg-icon icon-class="dashboard" style="font-size: 18px;" />
        </el-button>
      </el-badge>
      <el-badge v-show="showIssues && !isMobile" :value="countIssues" class="item" type="primary">
        <el-button
          v-show="showIssues"
          type="primary"
          size="mini"
          circle
          style="margin: 0px"
          @click="openRecordLogs('getListIssues')"
        >
          <i class="el-icon-s-promotion" />
        </el-button>
      </el-badge>
      <el-badge v-show="showChatAvailable && !isMobile" :value="countIsNote" class="item" type="primary">
        <el-button
          type="primary"
          size="mini"
          circle
          style="margin: 0px"
          @click="openRecordLogs('recordNotesTab')"
        >
          <svg-icon icon-class="message" />
        </el-button>
      </el-badge>
    </div>

    <el-drawer
      :visible.sync="showContainerInfo"
      :with-header="true"
      :before-close="openRecordLogs"
      :size="isDrawerWidth"
      class="drawer-panel-info"
    >
      <span slot="title">
        <svg-icon icon-class="tab" style="margin-right: 10px;" />
        {{ $t('window.containerInfo.log.tab') }}
        <span style="color: #606266; font-weight: bold;">
          {{ currentTabPanelInfo.name }}
        </span>
      </span>

      <panel-info
        v-if="showContainerInfo"
        :all-tabs-list="allTabsList"
        :show-container-info="showContainerInfo"
        :container-manager="containerManager"
        :current-record="currentRecordLogs"
        :tab-uuid="tabUuid"
        :is-accounting-info="isAccountingInfo"
        :default-opened-tab="defaultNameTab"
      />
    </el-drawer>
  </div>
</template>

<script>
import { defineComponent, computed, watch, ref } from '@vue/composition-api'

import router from '@/router'
import language from '@/lang'
import store from '@/store'

// Components and Mixins
import DefaultTable from '@/components/ADempiere/DataTable/index.vue'
import PanelDefinition from '@/components/ADempiere/PanelDefinition/index.vue'
import TabLabel from '@/components/ADempiere/TabManager/TabLabel.vue'
import PanelInfo from '../PanelInfo/index.vue'
import TabPanel from '@/components/ADempiere/TabManager/TabPanel/index.vue'
import TabOptions from './TabOptions.vue'

// Constants
import { UUID } from '@/utils/ADempiere/constants/systemColumns.js'
import { LOG_COLUMNS_NAME_LIST } from '@/utils/ADempiere/constants/systemColumns'

// API Request Methods
import { requestExistsReferences } from '@/api/ADempiere/recordManagement/referencesRecord.ts'
import {
  requestExistsChatsEntries, requestListEntityChats
} from '@/api/ADempiere/logs/tabInfo/chatsEntries.ts'
import { requestListResources } from '@/api/ADempiere/file-management/resource-reference.ts'
import { requestExistsIssues } from '@/api/ADempiere/logs/tabInfo/windowIssues.ts'

// Utils and Helper Methods
import { isEmptyValue, setRecordPath } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification'
import {
  createNewRecord,
  refreshRecord,
  undoChange
} from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'TabManager',

  components: {
    DefaultTable,
    PanelDefinition,
    TabPanel,
    PanelInfo,
    TabLabel,
    TabOptions
  },

  props: {
    parentUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    allTabsList: {
      type: Array,
      required: false
    },
    tabsList: {
      type: Array,
      default: () => []
    },
    actionsManager: {
      type: Object,
      default: () => ({})
    },
    // used only window
    isAccountingInfo: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const currentRoute = router.app._route

    const queryProperty = 'tab'
    // if tabParent is present in path set this
    const tabNo = currentRoute.query[queryProperty] || '0'
    const currentTab = ref(tabNo)

    const tabUuid = ref(props.tabsList[tabNo].uuid)

    const openPanelInfo = ref('')

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isDrawerWidth = computed(() => {
      if (isMobile.value) {
        return '100%'
      }
      return '65%'
    })

    const sizeBadgeRight = computed(() => {
      if (isMobile.value) {
        return 'width: 0%;height: 100%;position: fixed;right: 8.5%;top: 50%;z-index: 9;'
      }
      return 'width: 0%;height: 100%;position: absolute;right: 2%;top: 45%;z-index: 9;'
    })

    const tabStyle = computed(() => {
      if (store.state.app.device === 'mobile') {
        return {
          height: '100% !important'
        }
      }
      return {
        height: '100% !important',
        overflow: 'hidden'
      }
    })

    // Panel Info

    const currentRecordLogs = ref({})

    const drawer = ref(false)

    const showChatAvailable = ref(false)

    const showAttachmentAvailable = ref(false)

    const showReference = ref(false)

    const showIssues = ref(false)

    const showDashboard = ref(false)

    const countIssues = ref(0)

    const countDashboard = ref(0)

    const showIsNote = ref(false)

    const countIsNote = ref(0)

    const countReference = ref(0)

    const countAttachment = ref(0)

    // use getter to reactive properties
    const currentTabMetadata = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, tabUuid.value)
    })

    const showContainerInfo = computed(() => {
      return store.getters.getShowLogs
    })

    const clientUuid = computed(() => {
      const { client } = store.getters['user/getRole']
      return client.uuid
    })

    const isShowedTabs = computed(() => {
      const storedWindow = store.getters.getStoredWindow(props.parentUuid)
      return storedWindow.isShowedTabsParent
    })

    // Container Info
    const containerInfo = computed(() => {
      const inf = store.getters.getContainerInfo
      if (inf) {
        return inf
      }
      return {}
    })

    const currentTabId = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (currentTab) {
        const { id } = currentTab
        return id
      }
      return undefined
    })

    // Current Tab the Panel Info
    const currentTabPanelInfo = computed(() => {
      if (containerInfo.value.currentTab) {
        return containerInfo.value.currentTab
      }
      return {}
    })

    const recordId = computed(() => {
      if (isEmptyValue(currentTabPanelInfo.value)) return 1
      const { table } = currentTabPanelInfo.value
      const { key_columns, table_name } = table
      const currentReccord = store.getters.getTabCurrentRow({
        containerUuid: currentTabPanelInfo.value.containerUuid
      })
      if (!isEmptyValue(currentReccord[table_name + '_ID'])) return currentReccord[table_name + '_ID']
      if (!isEmptyValue(key_columns)) return currentReccord[key_columns[key_columns.length - 1]]
      return 1
    })

    const emptyMandatoryFields = computed(() => {
      if (isEmptyValue(currentTabPanelInfo.value)) return []
      return store.getters.getTabFieldsEmptyMandatory({
        parentUuid: currentTabPanelInfo.value.parentUuid,
        containerUuid: currentTabPanelInfo.value.containerUuid,
        formatReturn: false
      }).filter(itemField => {
        // omit send to server (to create or update) columns manage by backend
        return itemField.is_always_updateable ||
          !LOG_COLUMNS_NAME_LIST.includes(itemField.columnName)
      }).map(itemField => {
        return itemField.name
      })
    })

    const isShowedTableRecords = computed(() => {
      return currentTabMetadata.value.isShowedTableRecords
    })

    const isCreateNew = computed(() => {
      if (!isEmptyValue(currentRoute.query)) {
        return currentRoute.query.action === 'create-new' || currentRoute.query.options === 'create-new'
      }
      return false
    })
    const isWithChildsTab = computed(() => {
      return store.getters.getStoredWindow(props.parentUuid).tabsListChild
    })

    const defaultNameTab = computed(() => {
      return store.getters.getDefaultOpenedTab
    })

    function isDisabledTab(key) {
      return (key > 0) &&
        (isCreateNew.value || isEmptyValue(recordUuidTabParent.value))
    }

    function setCurrentTab() {
      store.commit('setCurrentTab', {
        parentUuid: props.parentUuid,
        tab: props.tabsList[currentTab.value]
      })
    }

    // create the table header
    const tableHeaders = computed(() => {
      const panel = props.tabsList[currentTab.value]
      if (panel && panel.fieldsList) {
        return panel.fieldsList
      }
      return []
    })

    // Current Record UUID
    const currentRecordUuid = computed(() => {
      if (currentTabMetadata.value) {
        return store.getters.getUuidOfContainer(currentTabMetadata.value.uuid)
      }
      return ''
    })
    // Current Record ID
    const currentRecordId = computed(() => {
      if (!isEmptyValue(currentRoute) && !isEmptyValue(currentRoute.query)) {
        return currentRoute.query.recordId
      }
      if (currentTabMetadata.value) {
        return store.getters.getIdOfContainer({
          containerUuid: currentTabMetadata.value.containerUuid,
          tableName: currentTabTableName.value
        })
      }
      return 0
    })

    /**
     * @param {object} tabHTML DOM HTML the tab clicked
     */
    const handleClick = (tabHTML) => {
      const { tabuuid, tabindex } = tabHTML.$attrs
      findRecordLogs(props.allTabsList[0])
      setTabNumber(tabindex)
      // chatAvailable()
      // attachmentAvailable()
      getReferences()

      // set metadata tab
      if (tabUuid.value !== tabuuid) {
        tabUuid.value = tabuuid
        setCurrentTab()
      }

      const containerInfo = store.getters.getContainerInfo
      if (!isEmptyValue(containerInfo)) {
        const currentTabDefinition = props.tabsList.find(row => row.uuid === tabuuid)
        if (!isEmptyValue(currentTabDefinition)) {
          if (!isEmptyValue(containerInfo.currentTab)) {
            store.dispatch('changeTabAttribute', {
              parentUuid: containerInfo.currentTab.parentUuid,
              containerUuid: containerInfo.currentTab.containerUuid,
              attributeName: 'isSelected',
              attributeValue: false
            })
          }
          const currentTabData = store.getters.getTabData({
            containerUuid: tabuuid
          })

          const recordsListTab = currentTabData.recordsList

          let currentRecord = {}
          if (isEmptyValue(recordsListTab)) {
            if (!currentTabData.isLoaded && !currentTabData.isLoading) {
              // load records
              getData()
            }
          } else {
            currentRecord = recordsListTab.find(row => row.UUID === store.getters.getUuidOfContainer(currentTabDefinition.containerUuid))
            store.dispatch('panelInfo', {
              currentTab: currentTabDefinition,
              currentRecord
            })
          }
          store.dispatch('changeTabAttribute', {
            parentUuid: currentTabDefinition.parentUuid,
            containerUuid: currentTabDefinition.containerUuid,
            attributeName: 'isSelected',
            attributeValue: true
          })
        }
      }

      setRecordPath({
        tab: tabindex
      })
    }

    const setTabNumber = (tabNumber = '0') => {
      if (isEmptyValue(tabNumber)) {
        tabNumber = '0'
      }
      if (tabNumber !== currentTab.value) {
        currentTab.value = tabNumber
      }

      setValuesPath({
        query: {
          ...currentRoute.query,
          tab: currentTab.value,
          [queryProperty]: currentTab.value
        },
        params: {
          ...currentRoute.params
        }
      })

      return tabNumber
    }

    const tabData = computed(() => {
      return store.getters.getTabData({
        containerUuid: currentTabMetadata.value.uuid
      })
    })

    const query = currentRoute.query

    const routerParams = currentRoute.params

    // get records list
    const recordsList = computed(() => {
      return tabData.value.recordsList
    })

    const isReadyFromGetData = computed(() => {
      return !tabData.value.isLoaded
    })

    const recordUuidTabParent = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: currentTabMetadata.value.firstTabUuid,
        columnName: UUID
      })
    })

    const currentTabTableName = computed(() => {
      return store.getters.getTableName(
        props.parentUuid,
        currentTabMetadata.value.firstTabUuid
      )
    })

    const getData = () => {
      const containerUuid = tabUuid.value
      let filters, filtersRecord
      const pageNumber = query.page
      if (query.filters) {
        filters = query.filters
      }
      if (!isEmptyValue(query.action)) {
        filtersRecord = {
          columnName: UUID,
          value: query.action
        }
      }

      const { keyColumn } = store.getters.getStoredTab(props.parentUuid, containerUuid)
      if (!isEmptyValue(query.recordId)) {
        filtersRecord = {
          columnName: keyColumn,
          value: Number(query.recordId)
        }
      } else if (!isEmptyValue(query[keyColumn])) {
        filtersRecord = {
          columnName: keyColumn,
          value: Number(query[keyColumn])
        }
      }
      if (!isEmptyValue(routerParams.filters)) {
        filters = routerParams.filters
      }
      if (isCreateNew.value) {
        store.commit('setTabData', {
          parentUuid: props.parentUuid,
          isLoaded: false,
          containerUuid
        })
      }
      const contextAttributes = store.getters.getTabData({
        containerUuid: currentRoute.query.containerUuid
      }).contextAttributes
      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        tabUuid: routerParams.containerUuid,
        containerUuid,
        filters,
        referenceUuid: query.referenceUuid,
        filtersRecord,
        pageNumber,
        contextAttributes
      }).then(responseData => {
        if (isCreateNew.value || isEmptyValue(responseData)) {
        // set values in panel
          props.containerManager.seekRecord({
            parentUuid: props.parentUuid,
            containerUuid,
            row: {}
          })
          return
        }
        let row = {}
        const { action } = query
        // uuid into action query
        if (!isEmptyValue(action) && action !== 'create-new') {
          if (action === 'zoomIn') {
            const { columnName, value } = currentRoute.query
            row = responseData.find(rowData => {
              return rowData[columnName] === value
            })
          } else {
            row = responseData.find(rowData => {
              return rowData.UUID === action
            })
          }
        }

        // set first record
        if (isEmptyValue(row)) {
          row = responseData[0]
        }

        //  set values in panel
        props.containerManager.seekRecord({
          parentUuid: props.parentUuid,
          containerUuid,
          row
        })
        const recordId = currentRecordId.value
        setValuesPath({
          query: {
            action: responseData.uuid,
            ...currentRoute.query,
            recordId
          },
          params: {
            ...currentRoute.params,
            filter: {},
            recordId
          }
        })
      })
    }

    function focusLost(currentTab) {
      const { containerUuid } = currentTab
      const columnName = store.getters.getFieldFocusColumnName
      const currentFieldFocus = document.getElementById(`${columnName}`)
      if (
        !isEmptyValue(currentFieldFocus) &&
        !isEmptyValue(currentFieldFocus.__vue__)
      ) {
        if (
          !isEmptyValue(currentFieldFocus.__vue__.customFocusLost)
        ) {
          currentFieldFocus.__vue__.customFocusLost()
        }
        if (
          !isEmptyValue(currentFieldFocus.__vue__.blur)
        ) {
          currentFieldFocus.__vue__.blur()
        }
      }
      store.dispatch('notifyFocusLost', {
        containerUuid,
        columnName,
        value: undefined
      })
    }

    function theAction(event) {
      const { currentTab } = store.getters.getContainerInfo
      switch (event.srcKey) {
        case 'new':
          newRecordTab(currentTab)
          break
        case 'save':
          focusLost(currentTab)
          setTimeout(() => {
            saveRecordTab(currentTab)
          }, 500)
          break
        case 'undo':
          undoChanges(currentTab)
          break
      }
    }

    if (
      isReadyFromGetData.value || (!isReadyFromGetData.value &&
      (
        !isEmptyValue(currentRoute.params.filters) ||
        !isEmptyValue(currentRoute.query.referenceUuid)) ||
        !isEmptyValue(currentRoute.query[currentTabTableName.value + '_ID'])
      )
    ) {
      getData()
    }
    watch(currentRecordLogs, (newValue, oldValue) => {
      const recordId = newValue[currentTabTableName.value + '_ID']
      const { query, params } = currentRoute
      setValuesPath({
        query: {
          action: newValue.UUID,
          ...query,
          recordId
        },
        params: {
          ...params,
          recordId
        }
      })
    })
    //  if changed tab and not records in stored, get records from server
    watch(tabUuid, (newValue, oldValue) => {
      if (newValue !== oldValue && !isEmptyValue(recordUuidTabParent.value) && !tabData.value.isLoaded) {
        getData()
      }
    })

    watch(currentRecordUuid, (newValue, oldValue) => {
      if (newValue !== oldValue && !isEmptyValue(newValue)) {
        // chatAvailable()
        attachmentAvailable()
        getReferences()
        getIssues()
        getIsNotes()
        getDashboard()
      }
    })

    watch(currentTabId, (newValue, oldValue) => {
      if (newValue !== oldValue && !isEmptyValue(newValue)) {
        getDashboard()
      }
    })

    /**
     * List Change History
     */
    const openRecordLogs = (options) => {
      if (!isEmptyValue(options) && typeof options === 'string') {
        store.commit('setDefaultOpenedTab', options)
      }
      store.dispatch('showLogs', {
        show: !showContainerInfo.value
      })
    }

    /**
     * Reference
     */
    const getReferences = () => {
      showReference.value = false
      const tab = currentTabMetadata.value
      const recordId = currentRecordId.value
      if (isEmptyValue(tab) || isEmptyValue(recordId)) {
        return
      }
      requestExistsReferences({
        tabId: tab.internal_id,
        recordId: recordId
      })
        .then(responseReferences => {
          const { record_count } = responseReferences
          if (record_count > 0) {
            showReference.value = true
            countReference.value = record_count
          }
          // const { referencesList } = responseReferences
          // showReference.value = !isEmptyValue(referencesList)
        })
        .catch(() => {})
    }

    /**
     * Issuess
     */
    const getIssues = () => {
      showIssues.value = false
      if (
        isEmptyValue(currentTabTableName.value) ||
        isEmptyValue(currentRecordId.value)
      ) {
        return
      }
      requestExistsIssues({
        tableName: currentTabTableName.value,
        recordUuid: currentRecordUuid.value,
        recordId: currentRecordId.value
      })
        .then(response => {
          const recordCount = response.record_count
          if (recordCount > 0) {
            showIssues.value = true
            countIssues.value = recordCount
            return
          }
          showIssues.value = false
          return
        })
        .catch(() => {})
    }

    /**
     * Notes
     */
    const getIsNotes = () => {
      showIsNote.value = false
      if (
        isEmptyValue(currentTabTableName.value) ||
        isEmptyValue(currentRecordId.value)
      ) {
        return
      }
      requestExistsChatsEntries({
        tableName: currentTabTableName.value,
        recordId: currentRecordId.value
      })
        .then(responseReferences => {
          const recordCount = responseReferences.record_count
          if (recordCount > 0) {
            showIsNote.value = true
            countIsNote.value = recordCount
            return
          }
          showIsNote.value = false
          return
        })
        .catch(() => {})
    }

    /**
     * Chat Available
     */
    const chatAvailable = () => {
      if (
        isEmptyValue(currentTabTableName.value) ||
        isEmptyValue(currentRecordUuid.value)
      ) {
        return
      }
      requestListEntityChats({
        tableName: currentTabTableName.value,
        recordId: currentRecordId.value,
        recordUuid: currentRecordUuid.value
      })
        .then(responseList => {
          const { entityChatsList } = responseList
          showChatAvailable.value = !isEmptyValue(entityChatsList)
        })
        .catch(error => {
          console.warn(`Error getting List Chat: ${error.message}. Code: ${error.code}.`)
        })
    }

    /**
     * Attachment Available
     */
    const attachmentAvailable = () => {
      showAttachmentAvailable.value = false
      if (isEmptyValue(currentTabTableName.value) ||
        (isEmptyValue(currentRecordUuid.value) &&
        (isEmptyValue(currentRecordId.value) || currentRecordId.value <= 0))) {
        return
      }
      requestListResources({
        recordId: currentRecordId.value,
        tableName: currentTabTableName.value,
        clientId: clientUuid.value,
        containerType: 'attachment'
      })
        .then(response => {
          countAttachment.value = response.resources.length
          showAttachmentAvailable.value = !isEmptyValue(response.resources)
        })
        // .catch(error => {
        //   console.warn(`Error getting Count Attachment: ${error.message}. Code: ${error.code}.`)
        //   showMessage({
        //     message: error.message,
        //     type: 'error'
        //   })
        // })
    }

    /**
     * Current Record
     */
    const findRecordLogs = (tab) => {
      currentRecordLogs.value = store.getters.getValuesView({
        parentUuid: tab.parentUuid,
        containerUuid: tab.containerUuid,
        format: 'object'
      })
    }

    /**
     * Exists Charts
     */
    const getDashboard = (tab) => {
      const storedWindow = store.getters.getStoredWindow(props.parentUuid)
      const { currentTab } = store.getters.getContainerInfo
      showDashboard.value = false
      if (isEmptyValue(storedWindow.internal_id) ||
        (isEmptyValue(currentTab))) {
        return
      }
      store.dispatch('isWindowDashboard', {
        tabId: currentTab.internal_id,
        windowId: storedWindow.internal_id
      })
        .then(responseDashboard => {
          if (responseDashboard > 0) {
            showDashboard.value = true
            countDashboard.value = responseDashboard
            return
          }
          showDashboard.value = false
          return
        })
        .catch(() => {})
    }

    /**
     * Set Values in the Path
     */
    const setValuesPath = ({ query, params }) => {
      if (query.options === 'create-new') {
        delete query.recordId
        delete params.recordId
      }
      router.push({
        query: query,
        params: params
      }, () => {})
    }

    const tabMetadata = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.containerUuid
      )
    })

    function changeShowedRecords() {
      store.dispatch('changeTabAttribute', {
        parentUuid: props.parentUuid,
        containerUuid: currentTabMetadata.value.uuid,
        attributeName: 'isShowedTableRecords',
        attributeValue: !currentTabMetadata.value.isShowedTableRecords
      })
      store.dispatch('changeTabAttribute', {
        parentUuid: props.parentUuid,
        containerUuid: currentTabMetadata.value.uuid,
        attributeName: 'isSelected',
        attributeValue: !currentTabMetadata.value.isSelected
      })
    }

    function selectTab(params) {
      store.dispatch('panelInfo', {
        currentTab: params
      })
    }

    function newRecordTab(currentTab) {
      createNewRecord.createNewRecord({
        parentUuid: currentTab.parentUuid,
        containerUuid: currentTab.containerUuid,
        isCopyValues: false
      })

      store.dispatch('panelInfo', {
        currentTab: currentTab,
        currentRecord: currentRecordUuid.value
      })
      const info = {
        fieldsList: currentTab.fieldsList,
        option: language.t('actionMenu.new')
      }
      store.dispatch('fieldListInfo', { info })
    }

    function undoChanges(currentTab) {
      const info = {
        fieldsList: currentTab.fieldsList,
        option: language.t('actionMenu.undo')
      }

      store.dispatch('fieldListInfo', { info })
      undoChange.undoChange({
        parentUuid: currentTab.parentUuid,
        containerUuid: currentTab.containerUuid
      })
    }

    function saveRecordTab(currentTab) {
      const emptyMandatory = emptyMandatoryFields.value.join(', ')
      if (!isEmptyValue(emptyMandatory)) {
        showMessage({
          message: language.t('notifications.mandatoryFieldMissing') + emptyMandatory,
          type: 'info'
        })
        return
      }

      const info = {
        fieldsList: currentTab.fieldsList,
        option: language.t('actionMenu.save')
      }

      store.dispatch('fieldListInfo', { info })
      const currentRoute = router.app._route
      const recordUuid = store.getters.getUuidOfContainer(currentTab.containerUuid)
      const currentReccord = store.getters.getTabCurrentRow({
        containerUuid: currentTab.containerUuid
      })
      let recordId = -1
      if (!isEmptyValue(currentReccord[currentTab.table_name + '_ID'])) recordId = currentReccord[currentTab.table_name + '_ID']
      store.dispatch('flushPersistenceQueue', {
        parentUuid: currentTab.parentUuid,
        containerUuid: currentTab.containerUuid,
        tabId: currentTab.internal_id,
        tableName: currentTab.table_name,
        recordUuid,
        recordId
      })
        .then(response => {
          const {
            name,
            query,
            params
          } = currentRoute
          let id = query.recordId
          if (!isEmptyValue(response)) id = response.id
          // refresh parent tab on document window
          if (!currentTab.isParentTab) {
            const { firstTabUuid } = currentTab
            const firstTab = store.getters.getStoredTab(
              currentTab.parentUuid,
              firstTabUuid
            )
            if (!isEmptyValue(firstTab) && firstTab.table.is_document) {
              refreshRecord.refreshRecord({
                parentUuid: currentTab.parentUuid,
                containerUuid: firstTabUuid
              })
            }
          }

          router.replace({
            name,
            query: {
              ...query,
              recordId: id,
              filters: []
            },
            params: {
              ...params,
              filters: []
            }
          }, () => {})
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'error'
          })
        })
    }

    findRecordLogs(props.allTabsList[0])

    setTabNumber(currentTab.value)
    chatAvailable()
    attachmentAvailable()
    getReferences()
    getIssues()
    getIsNotes()
    getDashboard()

    return {
      tabUuid,
      currentTab,
      currentTabId,
      tableHeaders,
      recordsList,
      drawer,
      clientUuid,
      currentRecordLogs,
      openPanelInfo,
      showChatAvailable,
      showAttachmentAvailable,
      showReference,
      showIssues,
      showIsNote,
      showDashboard,
      countAttachment,
      countIssues,
      countDashboard,
      countReference,
      countIsNote,
      defaultNameTab,
      // computed
      isMobile,
      isDrawerWidth,
      sizeBadgeRight,
      isShowedTabs,
      isShowedTableRecords,
      currentTabTableName,
      currentTabMetadata,
      tabStyle,
      tabMetadata,
      showContainerInfo,
      currentRecordUuid,
      currentRecordId,
      isWithChildsTab,
      containerInfo,
      currentTabPanelInfo,
      emptyMandatoryFields,
      recordId,
      // methods
      theAction,
      handleClick,
      changeShowedRecords,
      setValuesPath,
      findRecordLogs,
      openRecordLogs,
      isDisabledTab,
      selectTab,
      chatAvailable,
      attachmentAvailable,
      getReferences,
      getIssues,
      getIsNotes,
      getDashboard
    }
  }

})
</script>

<style lang="scss" scoped>
// Tab Manager
.tab-manager-container {
  .el-badge__content.is-fixed {
    right: 150% !important;
  }
  .el-tabs-container {
    height:auto !important
  }
  /*
  .el-card__body {
    height: 450px !important
  }
  */
}

.drawer-panel-info {
  header.el-drawer__header {
    margin-bottom: 10px !important;
    padding-top: 10px !important;
  }
}
@media screen and (min-height:720){
  tab-manager-container{
    .el-card__body{
      height: 400px !important
    }
  }
}

@media screen and (min-height:800px){
  tab-manager-container{
    .el-card__body{
      height: 400px !important
    }
  }
}
@media screen and (min-height: 1050px){
  .tab-manager-container{
    .el-card__body{
      height: 700px !important
    }
  }
}

@media screen and (min-height: 1200px){
  .tab-manager-container{
    .el-card__body{
      height: 850px !important
    }
  }
}
@media screen and (min-height: 1400px){
  .tab-manager-container{
    .el-card__body{
      height: 950px !important
    }
  }
}
</style>
