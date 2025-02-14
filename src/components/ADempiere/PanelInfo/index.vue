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
  validateng with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-container style="height: 100% !important;overflow: hidden;">
    <el-main style="padding:0px; height: 100% !important;overflow: hidden;" class="tab-panel-info">
      <el-tabs
        v-model="nameTab"
        type="border-card"
        class="tab-panel-info"
        @tab-click="handleClick"
      >
        <template
          v-for="(tab, index) in listInfoPanel"
        >
          <el-tab-pane
            v-if="tab.show"
            :key="index"
            :name="tab.name"
            lazy
            style="height: -webkit-fill-available;"
          >
            <span slot="label">
              <svg-icon v-if="tab.svg" :icon-class="tab.iconClass" />
              <i v-else :class="tab.iconClass" />
              {{ tab.title }}
            </span>
            <component
              :is="tab.component"
              :container-uuid="currentTab.containerUuid"
              :table-name="changeTableName"
              :container-manager="containerManager"
              :parent-uuid="currentTab.parentUuid"
              :record-uuid="currentRecordUuid"
              :list="recordsListStoreProduct"
              :record-id="currentRecordId"
              :tab-uuid="currentTab.uuid"
              :is-loading="tab.isLoading"
              style="height: 95%;"
            />
          </el-tab-pane>
        </template>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent, computed, watch, ref } from '@vue/composition-api'
import language from '@/lang'
import router from '@/router'
import store from '@/store'

// Components and Mixins
import AcctViewer from '@/components/ADempiere/Form/AcctViewer'
import AttachmentManager from './Component/AttachmentManager'
import RecordLogs from './Component/RecordLogs'
import recordIssues from './Component/RecordIssues'
import RecordNotes from './Component/RecordNotes'
import ReferenceRecords from './Component/ReferenceRecords'
import StoreProduct from './Component/storeProduct'
import WorkflowLogs from './Component/workflowLogs'
import LoadingView from '@/components/ADempiere/LoadingView'
import RecordDashboard from './Component/RecordDashboard'

// API Request Methods
import { listProductStorage } from '@/api/ADempiere/form/storeProduct.js'

// Utils and Helper Methods
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { isEmptyValue } from '@/utils/ADempiere'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
// import { isDisplayedField } from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'ContainerInfo',

  components: {
    AcctViewer,
    AttachmentManager,
    RecordLogs,
    RecordNotes,
    recordIssues,
    ReferenceRecords,
    StoreProduct,
    WorkflowLogs,
    RecordDashboard,
    LoadingView
  },

  props: {
    allTabsList: {
      type: Array,
      default: () => []
    },
    containerManager: {
      type: Object,
      required: true
    },
    currentRecord: {
      type: Object,
      required: true
    },
    showContainerInfo: {
      type: Boolean,
      default: false
    },
    tabUuid: {
      type: String,
      default: ''
    },
    defaultOpenedTab: {
      type: String,
      default: 'getRecordLogs'
    }
  },

  setup(props, { root }) {
    const currentRecordLogs = ref({ name: '' })
    const currentKey = ref(0)
    const typeAction = ref(0)
    const currentTabLogs = ref('0')
    const tableName = ref('')
    const nameTab = ref('getRecordLogs')
    const recordsListStoreProduct = ref([])
    const isLoadingListReference = ref(false)

    if (!isEmptyValue(props.defaultOpenedTab)) {
      nameTab.value = props.defaultOpenedTab
    }

    // use getter to reactive properties

    // Computed

    const listInfoPanel = computed(() => {
      return [
        {
          name: 'getRecordLogs',
          title: language.t('window.containerInfo.log.changeHistory'),
          show: true,
          svg: true,
          iconClass: 'tree-table',
          isLoading: isLoadingRecordLogsList.value,
          component: RecordLogs
        },
        {
          name: 'listReference',
          title: language.t('window.containerInfo.referenceRecords'),
          show: true,
          svg: false,
          isLoading: isLoadingListReference.value,
          iconClass: 'el-icon-zoom-in',
          component: ReferenceRecords
        },
        {
          name: 'recordAttachmentTab',
          title: language.t('component.attachment.label'),
          show: true,
          svg: false,
          isLoading: isLoadingListAttachment.value,
          iconClass: 'el-icon-paperclip',
          component: AttachmentManager
        },
        {
          name: 'recordNotesTab',
          title: language.t('window.containerInfo.notes'),
          show: true,
          svg: true,
          iconClass: 'message',
          isLoading: isLoadingNotesRecord.value,
          component: RecordNotes
        },
        {
          name: 'getListIssues',
          title: language.t('window.containerInfo.issues'),
          show: true,
          svg: true,
          iconClass: 'guide',
          isLoading: isLoadingIssuessRecord.value,
          component: recordIssues
        },
        {
          name: 'searchWorkflowHistory',
          show: isWorkflowLog.value,
          title: language.t('window.containerInfo.workflowLog'),
          svg: true,
          iconClass: 'tree-table',
          isLoading: false,
          component: WorkflowLogs
        },
        {
          name: 'accountingInformation',
          show: isAccountingInfo.value,
          title: language.t('window.containerInfo.accountingInformation.title'),
          svg: true,
          isLoading: false,
          iconClass: 'balance',
          component: AcctViewer // () => import('@/components/ADempiere/Form/AcctViewer')
        },
        {
          name: 'listProductStorage',
          show: !isEmptyValue(storeProduct.value),
          title: language.t('listStoreProduct.title'),
          svg: true,
          isLoading: false,
          iconClass: 'warehouse',
          component: StoreProduct
        },
        {
          name: 'listDashboard',
          show: !isEmptyValue(showPanelDashboard.value),
          title: language.t('navbar.dashboard'),
          svg: true,
          isLoading: false,
          iconClass: 'dashboard',
          component: RecordDashboard
        }
      ]
    })

    /**
     * Computed
     * isLoadLogs
     * isWorkflowLog
     * containerInfo
     * currentTab
     * storeProduct
     * showPanelInfo
     * currentRecordUuid
     * currentRecordId
     */
    const isLoadLogs = computed(() => {
      return store.state.utils.showRecordLogs
    })

    const showPanelDashboard = computed(() => {
      return store.getters.getNumberDashboard
    })

    // Container Info
    const containerInfo = computed(() => {
      const inf = store.getters.getContainerInfo
      if (inf) {
        return inf
      }
      return {}
    })
    const changeTableName = computed(() => {
      if (!isEmptyValue(containerInfo.value) && !isEmptyValue(containerInfo.value.currentTab)) {
        const current = containerInfo.value.currentTab
        return current.table_name
      }
      return props.allTabsList[0].table_name
    })
    // Current Tab
    const currentTab = computed(() => {
      if (containerInfo.value.currentTab) {
        return containerInfo.value.currentTab
      }
      return {}
    })

    // Current Record UUID
    const currentRecordUuid = computed(() => {
      if (!isEmptyValue(currentTab.value)) {
        return store.getters.getUuidOfContainer(currentTab.value.containerUuid)
      }
      return ''
    })

    // Current Record ID
    const currentRecordId = computed(() => {
      if (currentTab.value) {
        const { table } = currentTab.value
        const { key_columns, table_name } = table
        const currentRecord = store.getters.getTabCurrentRow({
          containerUuid: currentTab.value.containerUuid
        })
        if (!isEmptyValue(currentRecord[table_name + '_ID'])) return currentRecord[table_name + '_ID']
        if (!isEmptyValue(key_columns)) return currentRecord[key_columns[0]]
        return 1
      }
      return ''
    })

    // Store Product
    const storeProduct = computed(() => {
      return store.getters.getValueOfField({
        containerUuid: currentTab.value.containerUuid,
        columnName: 'M_Product_ID'
      })
    })

    // Current window
    const storedWindow = computed(() => {
      if (currentTab.value && currentTab.value.parentUuid) {
        return store.getters.getStoredWindow(currentTab.value.parentUuid)
      }
      return {}
    })

    const isWorkflowLog = computed(() => {
      if (currentTab.value) {
        return currentTab.value.table.is_document
      }
      return false
    })
    // Open Container the Info
    const showPanelInfo = computed(() => {
      return store.getters.getShowLogs
    })

    /**
     * IsLoading Optiones Tabs
     * @param {boolean} isLoadingNotesRecord
     * @param {boolean} isLoadingListAttachment
     * @param {boolean} isLoadingRecordLogsList
     * @param {boolean} isLoadingIssuessRecord
     */

    // Loading Notes Register
    const isLoadingNotesRecord = computed(() => {
      return store.getters.getIsLoadListChat
    })

    // Loading Notes Register
    const isLoadingListAttachment = computed(() => {
      return store.getters.getIsLoadListAttachment
    })

    // Loading Record Logs List
    const isLoadingRecordLogsList = computed(() => {
      return store.getters.getIsLoadListRecordLogs
    })

    const isLoadingIssuessRecord = computed(() => {
      return store.getters.getIsLoadListIssues
    })

    const accoutingSchemaId = computed(() => {
      return store.getters.getSessionContext({
        columnName: '$C_AcctSchema_ID'
      })
    })

    const isAccountingInfo = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!currentTab.table.is_document) {
        return false
      }
      if (isEmptyValue(currentRecordId.value)) {
        return false
      }

      // const { fieldsList } = currentTab
      // if (isEmptyValue(fieldsList)) {
      //   return false
      // }
      // const isPostedField = fieldsList.find(field => field.columnName === 'Posted')
      // if (isEmptyValue(isPostedField)) {
      //   return false
      // }
      // return isDisplayedField({
      //   ...isPostedField
      // })

      const isShowAccouting = store.getters.getIsShowAccoutingFacts
      return isShowAccouting
    })

    /**
     * Function Infomation Panel
     * findRecordLogs @param {object} tab
     * showkey  @param {number, number} key
     * handleClick @param {object} tab
     * findListStoreProduct @param {object} params
     */

    // Record
    function findRecordLogs(tab) {
      tableName.value = root.$store.getters.getTableName(tab.parentUuid, tab.containerUuid)
      currentRecordLogs.value = root.$store.getters.getValuesView({
        parentUuid: tab.parentUuid,
        containerUuid: tab.containerUuid,
        format: 'object'
      })
    }

    // showkey
    function showkey(key, index) {
      if (key === currentKey.value && index === typeAction.value) {
        currentKey.value = 1000
      } else {
        currentKey.value = key
        typeAction.value = index
      }
    }
    function handleClick(tab, event) {
      let tabOptions = tab.name
      if (tab.name === 'accountingInformation') {
        const { currentTab } = store.getters.getContainerInfo
        const recordId = currentRecordId.value
        if (isEmptyValue(recordId)) return
        store.dispatch('getAccoutingFactsFromServer', {
          recordUuid: currentRecordUuid.value,
          tableName: currentTab.table_name,
          searchValue: '',
          recordId
        })
        return
      }
      if (tab.name === 'listProductStorage') {
        findListStoreProduct()
        return
      }
      if (tab.name === 'recordAttachmentTab' || tab.name === language.t('component.attachment.label')) {
        tabOptions = 'getAttachment'
      }
      if (tab.name === language.t('window.containerInfo.notes')) {
        tabOptions = 'recordNotesTab'
      }
      if (tab.name === 'listDashboard') {
        const { currentTab } = store.getters.getContainerInfo
        if (isEmptyValue(storedWindow.value.internal_id) ||
          (isEmptyValue(currentTab))) {
          return
        }
        const dashboardList = store.getters.getPanelDashboard({
          tabId: currentTab.internal_id,
          recordId: currentRecordId.value
        })
        if (isEmptyValue(dashboardList)) {
          store.dispatch('listWindowDashboard', {
            tabId: currentTab.internal_id,
            windowId: storedWindow.value.internal_id,
            recordId: currentRecordId.value,
            tableName: currentTab.table_name
          })
        }
      }
      if (tab.name === 'listReference') {
        tabOptions = 'listReference'
        isLoadingListReference.value = true
        store.dispatch('getReferencesFromServer', {
          tableName: currentTab.value.table_name,
          containerUuid: currentTab.value.containerUuid,
          tabId: currentTab.value.internal_id,
          parentUuid: currentTab.value.parentUuid,
          recordId: currentRecordId.value,
          recordUuid: currentRecordUuid.value
        })
          .then(resp => {
            isLoadingListReference.value = false
          })
      }
      if (isEmptyValue(props.containerManager[tabOptions])) {
        return
      }
      nameTab.value = tab.name
      props.containerManager[tabOptions]({
        tableName: currentTab.value.table_name,
        containerId: router.app._route.meta.action_id,
        containerUuid: currentTab.value.containerUuid,
        parentUuid: currentTab.value.parentUuid,
        recordId: currentRecordId.value,
        recordUuid: currentRecordUuid.value
      })
    }

    function findListStoreProduct(params) {
      listProductStorage({
        tableName: currentTab.value.table_name,
        recordId: currentRecordId.value,
        recordUuid: currentRecordUuid.value
      })
        .then(response => {
          recordsListStoreProduct.value = response.records.map(record => {
            const { id, uuid, tableName, values } = record
            const { QtyOnHand, QtyOrdered, QtyReserved, QtyAvailable } = values
            return {
              ...values,
              QtyOnHand: formatQuantity({ value: Number(QtyOnHand.value) }),
              QtyOrdered: formatQuantity({ value: Number(QtyOrdered.value) }),
              QtyReserved: formatQuantity({ value: Number(QtyReserved.value) }),
              QtyAvailable: formatQuantity({ value: Number(QtyAvailable.value) }),
              DateLastInventory: formatDate({ value: values.DateLastInventory }),
              id,
              uuid,
              tableName
            }
          })
        })
    }

    /**
     * Watch
     * Information Panel Observers
     */

    watch(isLoadLogs, (newValue, oldValue) => {
      if (newValue) {
        findRecordLogs(props.allTabsList[parseInt(currentTabLogs.value)])
      }
    })

    watch(showPanelInfo, (newValue, oldValue) => {
      if (newValue) {
        handleClick({
          name: props.defaultOpenedTab
        })
      }
    })

    watch(() => props.defaultOpenedTab, (newValue) => {
      nameTab.value = newValue
    })

    if (showPanelInfo.value) {
      handleClick({
        name: props.defaultOpenedTab
      })
    }
    store.dispatch('findListMailTemplates')

    function showAccoutingFacts() {
      if (isEmptyValue(currentRecordId.value)) {
        store.commit('setIsShowAccoutingFacts', false)
        return
      }
      const { currentTab } = store.getters.getContainerInfo
      if (isEmptyValue(currentTab) || !currentTab.table.is_document) {
        store.commit('setIsShowAccoutingFacts', false)
        return
      }
      store.dispatch('getExistsAccoutingDocument', {
        accoutingSchemaId: accoutingSchemaId.value,
        tableName: currentTab.table_name,
        recordId: currentRecordId.value
      })
    }

    findRecordLogs(props.allTabsList[parseInt(currentTabLogs.value)])
    showAccoutingFacts()

    return {
      // Ref
      currentRecordLogs,
      currentKey,
      typeAction,
      currentTabLogs,
      tableName,
      nameTab,
      recordsListStoreProduct,
      // Computed
      currentTab,
      isLoadLogs,
      storeProduct,
      showPanelInfo,
      containerInfo,
      isWorkflowLog,
      listInfoPanel,
      currentRecordId,
      isAccountingInfo,
      currentRecordUuid,
      showPanelDashboard,
      changeTableName,
      // IsLoading
      isLoadingNotesRecord,
      isLoadingListAttachment,
      isLoadingListReference,
      isLoadingRecordLogsList,
      isLoadingIssuessRecord,
      // methods
      showkey,
      findRecordLogs,
      handleClick,
      findListStoreProduct,
      showAccoutingFacts
    }
  }

})
</script>

<style lang="scss">
.tab-panel-info {
  height: 100% !important;
  .el-tabs--border-card > .el-tabs__content {
    height: 100% !important;
    padding-left: 5px;
    padding-right: 5px;
  }
}
.scroll-panel-info {
  width: 100%;
  height: 800px;
}
</style>
