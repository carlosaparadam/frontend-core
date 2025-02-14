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
  <el-button
    v-show="isSaveRecord"
    plain
    size="small"
    type="primary"
    :loading="isSaveRecordLoading"
    :disabled="isSaveRecordLoading"
    :style="isMobile ? 'margin-left: 1px;padding-right: 6px;' : 'margin-left: 8px; padding-right: 9px;'"
    class="undo-changes-button"
    @click="saveChanges()"
  >
    <svg-icon icon-class="save-AD" />
    <span v-if="!isMobile">
      {{ $t('actionMenu.save') }}
    </span>
  </el-button>
</template>

<script>
import { computed, defineComponent, ref } from '@vue/composition-api'

import store from '@/store'
import language from '@/lang'

// Constants
import { LOG_COLUMNS_NAME_LIST } from '@/utils/ADempiere/constants/systemColumns'

// Utils and Melper Methods
import { isEmptyValue, setRecordPath } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'
import { refreshRecord } from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'SaveRecordButton',

  props: {
    parentUuid: {
      type: [String, Number],
      required: false
    },
    containerUuid: {
      type: [String, Number],
      required: true
    }
  },

  setup(props) {
    const isSaveRecordLoading = ref(false)

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.containerUuid)
    })

    const tabAttributes = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, props.containerUuid)
    })

    const isExistsChanges = computed(() => {
      const persistenceValues = store.getters.getPersistenceAttributesChanges({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordUuid: recordUuid.value
      })
      return !isEmptyValue(persistenceValues)
    })

    const emptyMandatoryFields = computed(() => {
      return store.getters.getTabFieldsEmptyMandatory({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        formatReturn: false
      }).filter(itemField => {
        // omit send to server (to create or update) columns manage by backend
        return itemField.is_always_updateable ||
          !LOG_COLUMNS_NAME_LIST.includes(itemField.columnName)
      }).map(itemField => {
        return itemField.name
      })
    })

    const isSaveRecord = computed(() => {
      const { table } = tabAttributes.value
      if (!isEmptyValue(table) && table.is_view) {
        return false
      }
      if (isEmptyValue(recordUuid.value) || recordUuid.value === 'create-new') {
        return true
      }

      return isExistsChanges.value
    })

    const recordId = computed(() => {
      const { table } = tabAttributes.value
      const { key_columns, table_name } = table
      const currentReccord = store.getters.getTabCurrentRow({
        containerUuid: tabAttributes.value.containerUuid
      })
      if (!isEmptyValue(currentReccord[table_name + '_ID'])) {
        return currentReccord[table_name + '_ID']
      }
      if (!isEmptyValue(key_columns)) {
        const keyIndex = key_columns.length - 1
        return currentReccord[key_columns.at(keyIndex)]
      }
      return -1
    })

    function saveChanges() {
      const emptyMandatory = emptyMandatoryFields.value.join(', ')
      if (!isEmptyValue(emptyMandatory)) {
        showMessage({
          message: language.t('notifications.mandatoryFieldMissing') + emptyMandatory,
          type: 'info'
        })
        return
      }

      const info = {
        fieldsList: tabAttributes.value.fieldsList,
        option: language.t('actionMenu.save')
      }

      store.dispatch('fieldListInfo', { info })
      isSaveRecordLoading.value = true

      store.dispatch('flushPersistenceQueue', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        tabId: tabAttributes.value.internal_id,
        tableName: tabAttributes.value.table_name,
        recordUuid: recordUuid.value,
        recordId: recordId.value
      })
        .then(response => {
          // refresh parent tab on document window
          if (!tabAttributes.value.isParentTab) {
            const { firstTabUuid } = tabAttributes.value
            const storedFirstTab = store.getters.getStoredTab(
              props.parentUuid,
              firstTabUuid
            )
            if (!isEmptyValue(storedFirstTab) && storedFirstTab.table.is_document) {
              refreshRecord.refreshRecord({
                parentUuid: props.parentUuid,
                containerUuid: firstTabUuid
              })
            }
          }
          setRecordPath({
            action: response.uuid,
            recordId: response.id
          })
        })
        .catch(error => {
          // console.error('Error saving record', error.message)
          showMessage({
            message: error.message,
            type: 'error'
          })
        })
        .finally(() => {
          isSaveRecordLoading.value = false
        })
    }

    return {
      isSaveRecordLoading,
      isMobile,
      isSaveRecord,
      // Methods
      saveChanges
    }
  }
})
</script>
