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
  <el-row class="tree-panel-definition" :gutter="10">
    <el-col :span="isMobile ? 24 : 6" class="tree-col" style="height: 100%;">
      <div class="tree-panel-container">
        <el-input
          v-model="filterValue"
          :placeholder="$t('component.tree.searchNodesOnTree')"
          class="tree-input-search"
          clearable
          suffix-icon="el-icon-search"
        />

        <!-- draggable
        :allow-drop="allowDrop"
        :allow-drag="allowDrag" -->
        <el-tree
          ref="treePanel"
          :data="storedTreeNodes"
          :props="defaultProps"
          node-key="record_id"
          :filter-node-method="filterNode"
          highlight-current
          :default-expanded-keys="expandedTree"
          @node-click="handleNodeClick"
          @node-drag-end="handleDragEnd"
        />
      </div>
    </el-col>

    <el-col class="tree-col-standard-panel" :span="isMobile ? 24 : 18">
      <draggable-panel
        v-if="panelMetadata.isEditSecuence"
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :container-manager="containerManager"
        :panel-metadata="panelMetadata"
        :is-show-filter="true"
        :is-filter-records="true"
        :is-advanced-query="true"
        :is-tab-panel="true"
      />
      <standard-panel
        v-else
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :container-manager="containerManager"
        :panel-metadata="panelMetadata"
        :is-show-filter="true"
        :is-filter-records="true"
        :is-advanced-query="true"
        :is-tab-panel="true"
      />
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent, computed, ref, watch, onMounted, nextTick } from '@vue/composition-api'

import store from '@/store'

// API Request Methods
import { requestGetTabEntity } from '@/api/ADempiere/user-interface/entities.ts'

// // Constants
// import { UUID } from '@/utils/ADempiere/constants/systemColumns.js'

// Components and Mixins
import DraggablePanel from '@/components/ADempiere/PanelDefinition/DraggablePanel.vue'
import StandardPanel from '@/components/ADempiere/PanelDefinition/StandardPanel.vue'

// Utils and Helper Methods
import { isSalesTransaction } from '@/utils/ADempiere/contextUtils'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { convertObjectToKeyValue } from '@/utils/ADempiere/valueFormat'

/**
 * Order or sequence panel based on the functionality of the `org.compiere.grid.VSortTab`
 */
export default defineComponent({
  name: 'TreePanel',

  components: {
    DraggablePanel,
    StandardPanel
  },

  props: {
    parentUuid: {
      type: [String, Number],
      default: undefined
    },
    containerUuid: {
      type: [String, Number],
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    /**
     * Ref
     */
    const treePanel = ref(null)
    const filterValue = ref('')

    /**
     * Const
     */
    const nodeName = 'name'
    const defaultProps = {
      children: 'childs',
      label: nodeName
    }

    /**
     * Get the panel object with all its attributes as well as
     * the fields it contains
     */
    const panelMetadata = computed(() => {
      return props.containerManager.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      }) || {}
    })

    /**
     * Computed Properties
     */
    const isMobile = computed(() => {
      return store.getters.device === 'mobile'
    })

    const storedTreeNodes = computed({
      set(newNodes) {
        console.log('newNodes', newNodes)
      },
      get() {
        return store.getters.getStoredTreeNodes({
          containerUuid: props.containerUuid
        }).recordsList
      }
    })

    const recordId = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        columnName: panelMetadata.value.keyColumn
      })
    })

    const expandedTree = computed(() => {
      if (isEmptyValue(recordId.value) || recordId.value === 'create-new') {
        return []
      }
      return [recordId.value]
    })

    const elementId = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        columnName: 'C_Element_ID'
      })
    })

    /**
     * Watch works directly on a ref
     */
    watch(filterValue, (newValue, oldValue) => {
      treePanel.value.filter(newValue)
    })

    // when element accouting change load tree data
    watch(elementId, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        loadData()
      }
    })

    // if changed record in parent tab, reload tab child
    watch(recordId, (newValue, oldValue) => {
      if (treePanel.value != null) {
        if (isEmptyValue(newValue) || newValue === 'create-new') {
          treePanel.value.setCurrentKey(null)
        } else { // if (newValue !== oldValue) {
          treePanel.value.setCurrentKey(newValue)
        }
      }
    })

    /**
     * Methods
     */
    function handleNodeClick(nodeData) {
      setRecord(nodeData.record_id)
    }

    function handleDragEnd(draggingNode, dropNode, dropType, ev) {
      console.log('tree drag end: ', {
        draggingNode,
        dropNode,
        dropType,
        ev
      })
    }

    async function getRowValues(recordId) {
      const { parentUuid, containerUuid } = props
      let row = store.getters.getTabRowData({
        containerUuid,
        recordUuid: recordId
      })

      if (isEmptyValue(row)) {
        const { id } = panelMetadata.value
        row = await requestGetTabEntity({
          tabId: id,
          recordId: recordId
        }).then(response => {
          return response.values
        })
      }

      const isSalesTransactionContext = isSalesTransaction({
        parentUuid,
        containerUuid,
        isRecord: false
      })
      const defaultValues = store.getters.getParsedDefaultValues({
        parentUuid,
        containerUuid,
        isSOTrxDictionary: isSalesTransactionContext,
        formatToReturn: 'object'
      })

      const attributes = convertObjectToKeyValue({
        object: Object.assign(defaultValues, row)
      })

      store.dispatch('notifyPanelChange', {
        parentUuid,
        containerUuid,
        attributes
        // isOverWriteParent: tabDefinition.isParentTab
      })

      return row
    }

    function setRecord(recordId) {
      /*
      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordUuid: recordId
      })
      */
      customSeekRecord(recordId)
    }

    function customSeekRecord(recordId) {
      const { parentUuid, containerUuid } = props
      const row = getRowValues(recordId)

      const tabDefinition = store.getters.getStoredTab(parentUuid, containerUuid)

      const fieldsList = store.getters.getStoredFieldsFromTab(parentUuid, containerUuid)

      // clear old values
      store.dispatch('clearPersistenceQueue', {
        containerUuid,
        recordUuid: row[panelMetadata.value.keyColumn] // row[UUID]
      }, {
        root: true
      })

      // active logics with set records values
      fieldsList.forEach(field => {
        // change Dependents
        store.dispatch('changeDependentFieldsList', {
          field,
          fieldsList,
          containerManager: props.containerManager,
          isGetDefaultValue: false
        })
      })

      // update records and logics on child tabs
      tabDefinition.childTabs.filter(tabItem => {
        const { hasBeenRendered } = store.getters.getStoredTab(parentUuid, tabItem.uuid)
        if (hasBeenRendered) {
          return true
        }
        // get loaded tabs with records
        return store.getters.getIsLoadedTabRecord({
          containerUuid: tabItem.uuid
        })
      }).forEach(tabItem => {
        // if loaded data refresh this data
        // TODO: Verify with get one entity, not get all list
        store.dispatch('getEntities', {
          parentUuid,
          containerUuid: tabItem.uuid,
          pageNumber: 1 // reload with first page
        })
      })
    }

    function loadData() {
      store.dispatch('getTreeNodesFromServer', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
        // nodeId
      }).finally(() => {
        if (treePanel.value != null) {
          treePanel.value.setCurrentKey(recordId.value)
        }
      })
    }

    function filterNode(value, data) {
      if (!value) {
        return true
      }
      return data[nodeName].toLowerCase().indexOf(value.toLowerCase()) !== -1
    }

    onMounted(() => {
      nextTick(() => {
        setTimeout(() => {
          if (treePanel.value != null) {
            treePanel.value.setCurrentKey(recordId.value)
          }
        }, 900)
      })
    })

    return {
      treePanel,
      filterValue,
      defaultProps,
      storedTreeNodes,
      // computeds
      isMobile,
      elementId,
      recordId,
      expandedTree,
      panelMetadata,
      // methods
      handleNodeClick,
      handleDragEnd,
      filterNode
    }
  }
})
</script>

<style lang="scss">
.tree-panel-container {
  // background: #e5e9f2;
  border-radius: 5px;
  border: 3px solid #d3dce6;

  padding: 5px;
  padding-top: 6px;
}
</style>
