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
  <el-main
    v-shortkey="QUICK_KEY_ACCESS"
    class="invoices-container"
    @shortkey.native="keyAction"
  >
    <query-criteria
      :uuid-form="uuidForm"
      :container-manager="containerManager"
      :metadata="metadata"
    />

    <table-records
      :uuid-form="uuidForm"
      :container-manager="containerManager"
      :metadata="metadata"
    />

    <panel-footer
      :uuid-form="uuidForm"
      :container-manager="containerManager"
      :metadata="metadata"
    />
  </el-main>
</template>

<script>
import {
  computed, defineComponent, onUnmounted, watch
} from '@vue/composition-api'

import store from '@/store'

// Constants
import {
  INVOICES_LIST_FORM,
  COLUMN_NAME
} from '@/utils/ADempiere/dictionary/field/search/invoice.js'
import {
  QUICK_KEY_ACCESS
} from '@/utils/ADempiere/dictionary/field/search/index.ts'

// Components and Mixins
import QueryCriteria from './QueryCriteria/index.vue'
import TableRecords from './tableRecords.vue'
import PanelFooter from './panelFooter.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import useInvoice from './useInvoce'

export default defineComponent({
  name: 'PanelForm',

  components: {
    QueryCriteria,
    TableRecords,
    PanelFooter
  },

  props: {
    containerManager: {
      type: Object,
      default: () => ({
        actionPerformed: () => {},
        getFieldsLit: () => {},
        setDefaultValues: () => {}
      })
    },
    metadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: INVOICES_LIST_FORM,
          columnName: COLUMN_NAME
        }
      }
    },
    showPopover: {
      type: Boolean,
      default: () => false
    }
  },

  setup(props) {
    const uuidForm = computed(() => {
      if (!isEmptyValue(props.metadata.containerUuid)) {
        return props.metadata.columnName + '_' + props.metadata.containerUuid
      }
      return INVOICES_LIST_FORM
    })

    const {
      invoiceData,
      isLoadedRecords,
      isLoadingRecords,
      isSalesTransactionContext,
      keyAction,
      loadRecordsList
    } = useInvoice({
      uuidForm: uuidForm.value,
      parentUuid: props.metadata.parentUuid,
      containerUuid: props.metadata.containerUuid,
      containerManager: props.containerManager,
      fieldAttributes: props.metadata
    })

    const isReadyFromGetData = computed(() => {
      return !isLoadedRecords.value && props.showPopover
    })

    watch(isReadyFromGetData, (newValue, oldValue) => {
      if (newValue) {
        loadRecordsList({})
      }
    })

    if (isReadyFromGetData.value || isSalesTransactionContext.value !== invoiceData.value.isSalesTransaction) {
      loadRecordsList({})
    }

    function subscribeAccoutingFacts() {
      return store.subscribe((mutation, state) => {
        const enabledMutations = ['setInvoiceFieldQueryFilters', 'setInvoiceFieldQueryFilterByAttribute']
        if (enabledMutations.includes(mutation.type)) {
          loadRecordsList({})
        }
      })
    }

    const unsubscribeAccoutingFacts = subscribeAccoutingFacts()

    function setInitialValues() {
      const storedInvoiceData = store.getters.getInvoceData({
        containerUuid: props.metadata.containerUuid
      })
      store.commit('setInvoiceFieldData', {
        ...storedInvoiceData,
        containerUuid: props.metadata.containerUuid
      })
    }

    onUnmounted(() => {
      setInitialValues()
      unsubscribeAccoutingFacts()
    })

    return {
      QUICK_KEY_ACCESS,
      //
      uuidForm,
      isLoadingRecords,
      isReadyFromGetData,
      //
      keyAction
    }
  }
})
</script>

<style lang="scss">
.invoices-container {
  padding-top: 0px;
  padding-bottom: 0px;
}
</style>
