<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
    v-shortkey="shortsKey"
    v-loading="isLoadingFields"
    class="general-info-list-container"
    style="padding-top: 0px"
    @shortkey.native="keyAction"
  >
    <el-collapse v-model="activeAccordion" accordion class="general-info-list-query-criteria">
      <el-collapse-item name="query-criteria">
        <template slot="title">
          {{ title }}
        </template>

        <el-form
          label-position="top"
          size="small"
          @submit.native.prevent="notSubmitForm"
        >
          <el-row>
            <field-definition
              v-for="(fieldAttributes) in storedFieldsListQuery"
              :key="fieldAttributes.columnName"
              :metadata-field="fieldAttributes"
              :container-uuid="uuidForm"
              :container-manager="containerManagerList"
              :size-col="6"
            />
          </el-row>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <el-table
      ref="generalInfoTable"
      v-loading="isloadingTable"
      class="general-info-table"
      :data="recordsList"
      highlight-current-row
      border
      fit
      :max-height="300"
      size="mini"
      :row-class-name="tableRowClassName"
      @current-change="handleCurrentChange"
      @row-dblclick="changeCurrentRecord"
    >
      <p slot="empty" style="width: 100%;">
        {{ $t('businessPartner.emptyBusinessPartner') }}
      </p>

      <index-column
        :page-number="pageNumber"
        :page-size="pageSize"
      />

      <el-table-column
        v-for="(fieldAttributes, key) in storedColumnsListTable"
        :key="key"
        :label="fieldAttributes.name"
        :prop="fieldAttributes.column_ame"
        min-width="210"
      >
        <template slot-scope="scope">
          <!-- formatted displayed value -->
          <cell-display-info
            :parent-uuid="metadata.parentUuid"
            :container-uuid="uuidForm"
            :field-attributes="{
              column_name: fieldAttributes.column_name,
              display_type: fieldAttributes.display_type
            }"
            :container-manager="containerManagerList"
            :scope="scope"
            :data-row="scope.row"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-row :gutter="24" class="general-info-list-footer">
      <el-col :span="14">
        <custom-pagination
          :container-manager="containerManagerList"
          :total-records="generalInfoData.recordCount"
          :selection="selection"
          :page-number="pageNumber"
          :page-size="recordsList.length"
          :handle-change-page-number="setPageNumber"
          :handle-change-page-size="handleChangeSizePage"
        />
      </el-col>

      <el-col :span="10">
        <samp style="float: right; padding-top: 4px;">
          <el-button
            type="info"
            class="button-base-icon"
            plain
            @click="clearFormValues(); getListSearchRecords();"
          >
            <svg-icon icon-class="layers-clear" />
          </el-button>

          <el-button
            :loading="isLoadingRecords"
            type="success"
            class="button-base-icon"
            icon="el-icon-refresh-right"
            size="small"
            @click="getListSearchRecords();"
          />

          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            size="small"
            @click="closeList(); clearValues();"
          />

          <el-button
            type="primary"
            class="button-base-icon"
            icon="el-icon-check"
            @click="changeCurrentRecord()"
          />
        </samp>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import lang from '@/lang'
import store from '@/store'

// Constants
import { GENERAL_INFO_SEARCH_LIST_FORM } from '@/utils/ADempiere/dictionary/field/search/index.ts'
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'
import { OPERATOR_LIKE } from '@/utils/ADempiere/dataUtils'

// Components and Mixins
import fieldSearchMixin from '../mixinFieldSearch'
import CellDisplayInfo from '@/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'
import FieldDefinition from '@/components/ADempiere/FieldDefinition/index.vue'
import CustomPagination from '@/components/ADempiere/DataTable/Components/CustomPagination.vue'
import IndexColumn from '@/components/ADempiere/DataTable/Components/IndexColumn.vue'

// Utils and Helper Methods
import { isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils'
import { containerManager as containerManagerForm } from '@/utils/ADempiere/dictionary/form'
import { showMessage } from '@/utils/ADempiere/notification'
import { tableRowClassName } from '@/utils/ADempiere/dictionary/field/search/index.ts'

/**
 * TODO: Disable select inactive records.
 */
export default {
  name: 'PanelGeneralInfoSearch',

  components: {
    CellDisplayInfo,
    CustomPagination,
    FieldDefinition,
    IndexColumn
  },

  mixins: [
    fieldSearchMixin
  ],

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: GENERAL_INFO_SEARCH_LIST_FORM,
          columnName: undefined,
          elementName: undefined
        }
      }
    },
    showPopover: {
      type: Boolean,
      default: () => false
    },
    containerManager: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      activeAccordion: 'query-criteria',
      timeOutRecords: null,
      isLoadingRecords: false,
      timeOutFields: null,
      isLoadingFields: false,
      unsubscribe: () => {}
    }
  },

  computed: {
    title() {
      let title = this.metadata.name
      if (!isEmptyValue(this.metadata.panelName) && !isSameValues(this.metadata.panelName, this.metadata.name)) {
        title += ` (${this.metadata.panelName})`
      }
      return title
    },
    uuidForm() {
      if (!isEmptyValue(this.metadata.containerUuid)) {
        return this.metadata.columnName + '_' + this.metadata.containerUuid
      }
      return GENERAL_INFO_SEARCH_LIST_FORM
    },
    shortsKey() {
      return {
        close: ['esc'],
        refreshList: ['f5']
      }
    },
    selection() {
      if (isEmptyValue(this.currentRow)) {
        return 0
      }
      return 1
    },
    containerManagerList() {
      return {
        ...this.containerManager,
        ...containerManagerForm,
        actionPerformed: () => {},
        getFieldsLit: () => {},
        isDisplayedField: () => { return true },
        isDisplayedDefault: () => { return true },
        isReadOnlyColumn: ({ field, row }) => { return true },
        setDefaultValues: () => {},
        setPageNumber: this.setPageNumber
      }
    },
    storedFieldsListQuery() {
      return store.getters.getSearchQueryFields({
        tableName: this.searchTableName
      })
        .map(fieldItem => {
          return {
            ...fieldItem,
            containerUuid: this.uuidForm
          }
        })
    },
    storedColumnsListTable() {
      return store.getters.getSearchTableFields({
        tableName: this.searchTableName
      })
        .filter(fieldItem => {
          return fieldItem.sequence > 0
        })
    },
    isloadingTable() {
      return this.isLoadingRecords && !isEmptyValue(this.storedColumnsListTable)
    },
    generalInfoData() {
      return store.getters.getGeneralInfoData({
        containerUuid: this.uuidForm
      })
    },
    pageNumber() {
      return this.generalInfoData.pageNumber
    },
    pageSize() {
      return this.generalInfoData.pageSize
    },
    isReadyFromGetData() {
      const { isLoaded } = this.generalInfoData
      return !isLoaded && this.showPopover
    },
    currentRow: {
      set(rowSelected) {
        store.commit('setGeneralInfoSelectedRow', {
          containerUuid: this.uuidForm,
          currentRow: rowSelected
        })
      },
      get() {
        return store.getters.getGeneralInfoCurrentRow({
          containerUuid: this.uuidForm
        })
      }
    }
  },

  watch: {
    isReadyFromGetData(isToLoad) {
      if (isToLoad) {
        this.getListSearchRecords()
      }
    }
  },

  created() {
    this.unsubscribe = this.subscribeChanges()

    this.loadSearchFields()

    if (this.isReadyFromGetData) {
      this.getListSearchRecords()
    }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$refs.generalInfoTable) {
        this.$refs.generalInfoTable.setCurrentRow(this.currentRow)
      }
    })
  },

  beforeDestroy() {
    this.unsubscribe()
  },

  methods: {
    tableRowClassName,
    handleCurrentChange(newCurrentRow, oldCurrentRow) {
      if (isEmptyValue(newCurrentRow)) {
        return
      }
      if (newCurrentRow.is_active === false || newCurrentRow.IsActive === false) {
        return
      }
      this.currentRow = newCurrentRow
    },
    keyAction(event) {
      switch (event.srcKey) {
        case 'refreshList':
          /**
           * TODO: When refreshing you are making 2 list requests, you can be the
           * observer that activates the second request
          */
          this.getListSearchRecords()
          break

        case 'close':
          this.closeList()
          break
      }
    },
    changeCurrentRecord(row, column, event) {
      let recordRow = row
      if (isEmptyValue(recordRow)) {
        recordRow = this.currentRow
      }
      if (recordRow.is_active === false || recordRow.IsActive === false) {
        showMessage({
          type: 'warning',
          message: lang.t('field.inactiveRecordNoSelect')
        })
        return
      }
      if (!isEmptyValue(recordRow)) {
        this.setValues(recordRow)
        this.closeList()
      }
    },
    closeList() {
      store.commit('setGeneralInfoShow', {
        containerUuid: this.uuidForm,
        show: false
      })
    },
    setPageNumber(pageNumber) {
      this.getListSearchRecords(pageNumber, this.pageSize)
    },
    subscribeChanges() {
      return store.subscribe((mutation, state) => {
        if (mutation.type === 'updateValueOfField') {
          if (mutation.payload.containerUuid === this.uuidForm) {
            if (!isEmptyValue(mutation.payload.columnName)) {
              this.getListSearchRecords()
            }
          }
        }
      })
    },
    loadSearchFields() {
      const fieldsListTable = this.storedColumnsListTable
      if (isEmptyValue(fieldsListTable)) {
        this.containerManager.getSearchDefinition({
          id: this.metadata.internal_id
        })
          .finally(() => {
            this.isLoadingFields = false
          })
      }
    },
    getListSearchRecords(pageNumber = 0, pageSize) {
      const values = store.getters.getValuesView({
        containerUuid: this.uuidForm,
        format: 'array'
      })
        .filter(attribute => {
          if (attribute.columnName.startsWith(DISPLAY_COLUMN_PREFIX)) {
            return false
          }
          return !isEmptyValue(attribute.value)
        })
        .map(attribute => {
          if (!isEmptyValue(attribute) && !isEmptyValue(attribute.value) && (String(attribute.value).startsWith('%') || String(attribute.value).endsWith('%'))) {
            return {
              ...attribute,
              operator: OPERATOR_LIKE.operator
            }
          }
          return attribute
        })

      this.isLoadingRecords = true

      clearTimeout(this.timeOutRecords)
      this.timeOutRecords = setTimeout(() => {
        // search on server
        this.containerManager.getSearchRecordsList({
          containerUuid: this.uuidForm,
          parentUuid: this.metadata.parentUuid,
          tableName: this.searchTableName,
          columnName: this.metadata.columnName,
          id: this.metadata.internal_id,
          contextColumnNames: this.metadata.reference.context_column_names,
          filters: values,
          pageNumber,
          pageSize
        })
          .then(response => {
            if (isEmptyValue(response)) {
              this.$message({
                type: 'warning',
                showClose: true,
                message: this.metadata.name + this.$t('infoSearch.notFound')
              })
            }

            this.$nextTick(() => {
              if (this.$refs.generalInfoTable) {
                this.$refs.generalInfoTable.setCurrentRow(this.currentRow)
              }
            })
          })
          .finally(() => {
            this.isLoadingRecords = false
          })
      }, 500)
    },
    handleChangeSizePage(pageSize) {
      this.getListSearchRecords(1, pageSize)
    }
  }
}
</script>

<style lang="scss">
.general-info-list-container {
  .general-info-list-query-criteria {
    // space between quey criteria and table
    .el-collapse-item__content {
      padding-bottom: 0px !important;
    }
  }
  .general-info-table {
    .el-table__cell {
      padding: 0px !important;
      &.is-leaf {
        padding: 6px !important;
      }
    }
  }
}
</style>
