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
  <el-autocomplete
    ref="autocompleteInvoice"
    v-model="displayedValue"
    v-bind="commonsProperties"
    value-key="name"
    clearable
    style="width: 100%;"
    popper-class="custom-field-bpartner-info"
    :trigger-on-focus="false"
    :fetch-suggestions="localSearch"
    :select-when-unmatched="true"
    :highlight-first-item="true"
    :size="sizeField"
    @keyup.native="enterKey"
    @select="handleSelect"
    @clear="clearValues"
    @focus="searchFocus"
    @blur="setOldDisplayedValue"
  >
    <template slot-scope="recordRow">
      <div class="header">
        {{ recordRow.item.document_no }}
      </div>
      <span class="info">
        {{ formatDate({ value: recordRow.item.date_invoiced }) }}
        -
        {{ formatQuantity({ value: recordRow.item.grand_total }) }}
      </span>
    </template>

    <button-list
      slot="append"
      :parent-metadata="metadata"
      :container-manager="containerManager"
      :is-disabled="isDisabled"
    />
  </el-autocomplete>
</template>

<script>
// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldSearchMixin from '@/components/ADempiere/FieldDefinition/FieldSearch/mixinFieldSearch.js'
import invoiceMixin from './mixinInvoice'
import ButtonList from './buttonList.vue'

// Constants
import { TABLE_NAME, COLUMN_NAME } from '@/utils/ADempiere/dictionary/field/search/invoice.js'
import { RECORD_ROWS_BY_LIST } from '@/utils/ADempiere/dictionary/field/lookups'
import {
  DISPLAY_COLUMN_PREFIX,
  UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX
} from '@/utils/ADempiere/dictionaryUtils'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default {
  name: 'InvoiceInfoField',

  components: {
    ButtonList
  },

  mixins: [
    fieldMixin,
    fieldSearchMixin,
    invoiceMixin
  ],

  props: {
    containerManager: {
      type: Object,
      required: true
    },
    parentMetadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: ''
        }
      }
    },
    sizeField: {
      type: String,
      default: undefined
    }
  },

  computed: {
    cssClassCustomField() {
      return ' custom-field-bpartner-info '
    },
    // to recrods list overwrite
    uuidForm() {
      return this.metadata.containerUuid
    }
  },

  beforeMount() {
    if (this.metadata.displayed) {
      this.setDisplayedValue()
      this.setInitialValues()
    }
  },

  methods: {
    formatDate,
    formatQuantity,
    enterKey(event) {
      // TODO: Implement key enter event.
    },
    setInitialValues() {
      const storedInvoiceData = this.$store.getters.getInvoceData({
        containerUuid: this.metadata.containerUuid
      })
      this.$store.commit('setInvoiceFieldData', {
        ...storedInvoiceData,
        containerUuid: this.metadata.containerUuid
      })
    },
    searchFocus() {
      // if (this.recordsList.length <= 1) {
      //   this.$refs.autocompleteInvoice.close()
      // } else {
      //   this.$refs.autocompleteInvoice.getData()
      // }
      if (!isEmptyValue(this.displayedValue)) {
        this.$refs.autocompleteInvoice.$el.firstElementChild.firstElementChild.select()
      }
      this.setNewDisplayedValue()
    },
    keyPressField() {
      if (!this.isEmptyValue(this.$refs['autocompleteInvoice' + this.metadata.columnName])) {
        this.remoteSearch(this.displayedValue, true)
      }
    },
    handleSelect(recordSelected) {
      if (isEmptyValue(recordSelected) || recordSelected[COLUMN_NAME] <= 0) { // || isEmptyValue(recordSelected.UUID)) {
        // set empty values
        recordSelected = this.blankValues
      }

      this.setValues(recordSelected)

      // prevent losing display value with focus
      this.controlDisplayed = this.generateDisplayedValue(recordSelected)
      this.$refs.autocompleteInvoice.activated = false
    },
    setValues(recordRow) {
      const { columnName, elementName, isSameColumnElement, containerUuid, parentUuid } = this.metadata
      const { uuid, id, document_no, date_invoiced, grand_total } = recordRow
      let displayValue = document_no
      if (!isEmptyValue(date_invoiced)) displayValue += '_' + this.formatDate({ value: date_invoiced })
      if (!isEmptyValue(grand_total)) displayValue += '_' + this.formatQuantity({ value: grand_total })
      // console.log(displayValue)

      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName,
        value: id
      })
      // set display column (name) value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        // DisplayColumn_'ColumnName'
        columnName: DISPLAY_COLUMN_PREFIX + columnName,
        value: displayValue
      })
      // set UUID value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName: columnName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
        value: uuid
      })
      // update element column name (smart browse)
      if (!isSameColumnElement) {
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          columnName: elementName,
          value: id
        })
        // set display column (name) value
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: DISPLAY_COLUMN_PREFIX + elementName,
          value: displayValue
        })
      }

      // implement container manager row
      if (this.metadata.inTable) {
        this.containerManager.setCell({
          containerUuid,
          rowIndex: this.metadata.rowIndex,
          rowUid: this.metadata.rowUid,
          columnName,
          value: id
        })
        this.containerManager.setCell({
          containerUuid,
          rowIndex: this.metadata.rowIndex,
          rowUid: this.metadata.rowUid,
          columnName: DISPLAY_COLUMN_PREFIX + columnName,
          value: displayValue
        })
        return
      }

      this.$store.dispatch('notifyFieldChange', {
        containerUuid,
        containerManager: this.containerManager,
        field: this.metadata,
        columnName,
        newValue: id
      })
    },
    remoteSearch(searchValue, isKeyEnterPress) {
      return new Promise(resolve => {
        let parentUuid = this.metadata.parentUuid
        if (isEmptyValue(parentUuid)) {
          parentUuid = this.metadata.containerUuid
        }

        this.isLoading = true
        this.containerManager.getSearchRecordsList({
          parentUuid,
          containerUuid: this.metadata.containerUuid,
          contextColumnNames: this.metadata.reference.context_column_names,
          tableName: TABLE_NAME,
          columnName: this.metadata.column_name,
          uuid: this.metadata.uuid,
          id: this.metadata.internal_id,
          searchValue,
          pageNumber: 1,
          pageSize: RECORD_ROWS_BY_LIST
        })
          .then(responseRecords => {
            if (isEmptyValue(responseRecords)) {
              this.whitOutResultsMessage()
            }

            resolve(responseRecords)
          })
          .catch(error => {
            console.warn(error.message)

            this.whitOutResultsMessage()
            resolve([])
          })
          .finally(() => {
            this.isLoading = false
            if (isKeyEnterPress || this.recordsList.length === 1) {
              const recordSelected = this.recordsList.at()
              this.handleSelect(recordSelected)
            }
          })
      })
    }
  }
}
</script>

<style lang="scss" scope>
.custom-field-bpartner-info {
  // items of lust
  li {
    line-height: normal;
    // padding: 15px;
    padding-bottom: 5px;
    padding-top: 5px;

    .header {
      text-overflow: ellipsis;
      overflow: hidden;
      font-weight: bold;
    }

    .info {
      color: #7e7e7e;
      float: left;
      font-size: 12px;
    }
  }
}
</style>
