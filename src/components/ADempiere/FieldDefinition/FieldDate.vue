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
  <el-date-picker
    v-model="value"
    v-bind="commonsProperties"
    :format="formatView"
    :value-format="formatSend"
    :type="typePicker"
    range-separator="-"
    :start-placeholder="$t('component.date.startDate')"
    :end-placeholder="$t('component.date.endDate')"
    unlink-panels
    :size="sizeField"
    :picker-options="pickerOptions"
    @change="preHandleChange"
    @blur="focusLost"
    @focus="focusGained"
    @keydown.native="keyPressed"
    @keyup.native="keyReleased"
  />
</template>

<script>
// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'

// Constants
import { DATE_PLUS_TIME } from '@/utils/ADempiere/references'
import {
  MULTIPLE_VALUES_OPERATORS_LIST, RANGE_VALUE_OPERATORS_LIST
} from '@/utils/ADempiere/dataUtils'
import {
  SHORCUTS_DATE, SHORCUTS_DATE_RANGE
} from '@/utils/ADempiere/componentUtils'

// Utils and Helper Methods
import { getTypeOfValue, isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

/**
 * TODO: Improves set values into store and set in vales in component when change operators
 */
export default {
  name: 'FieldDate',

  mixins: [
    fieldMixin
  ],

  props: {
    sizeField: {
      type: String,
      default: undefined
    }
  },

  data() {
    return {
      pickerOptionsDate: {
        shortcuts: SHORCUTS_DATE
      },
      pickerOptionsDateRange: {
        shortcuts: SHORCUTS_DATE_RANGE
      }
    }
  },

  computed: {
    isMultipleValues() {
      return !isEmptyValue(this.metadata.operator) &&
        MULTIPLE_VALUES_OPERATORS_LIST.includes(this.metadata.operator)
    },
    isRenderRange() {
      if (!isEmptyValue(this.metadata.operator)) {
        return RANGE_VALUE_OPERATORS_LIST.includes(this.metadata.operator)
      }
      return this.metadata.is_range
    },
    typePicker() {
      let picker = 'date'
      if (this.isMultipleValues) {
        picker += 's'
        return picker
      }
      // Date + Time reference (16)
      if (this.metadata.display_type === DATE_PLUS_TIME.id) {
        picker += 'time'
      }
      if (this.isRenderRange && !this.metadata.inTable) {
        picker += 'range'
      }
      return picker
    },
    cssClassCustomField() {
      return ' custom-field-date '
    },
    /**
     * Parse the date format to be compatible with element-ui
     */
    formatView() {
      let format = ''
      const currentLanguageDefinition = this.$store.getters['getCurrentLanguageDefinition']
      if (!isEmptyValue(this.metadata.vFormat)) {
        format = this.metadata.vFormat
      }
      if (isEmptyValue(format)) {
        format = 'yyyy-MM-dd'
        if (!isEmptyValue(currentLanguageDefinition)) {
          const { datePattern } = currentLanguageDefinition
          if (!isEmptyValue(datePattern)) {
            format = datePattern
          }
        }
      }
      let formattedFormat = format
        .replace(/[Y]/gi, 'y')
        .replace(/[m]/gi, 'M')
        .replace(/[D]/gi, 'd')
      if (this.metadata.display_type === DATE_PLUS_TIME.id) {
        if (!isEmptyValue(currentLanguageDefinition)) {
          const { time_pattern } = currentLanguageDefinition
          if (!isEmptyValue(time_pattern)) {
            formattedFormat = formattedFormat + ' ' + time_pattern
            return formattedFormat
              .replace(/[z]/gi, '')
          }
        }
        formattedFormat = formattedFormat + ' hh:mm:ss A'
      }
      return formattedFormat
    },
    formatSend() {
      let format = 'yyyy-MM-dd'
      if (this.metadata.display_type === DATE_PLUS_TIME.id) {
        format += ' HH:mm:ss'
      }
      return format
        .replace(/[h]/gi, 'H')
        .replace(/[aA]/gi, '')
    },
    pickerOptions() {
      if (this.typePicker === 'daterange') {
        return this.pickerOptionsDateRange
      }
      return this.pickerOptionsDate
    },
    value: {
      get() {
        const { columnName, containerUuid, inTable } = this.metadata

        // table records values
        if (inTable) {
          // implement container manager row
          const value = this.containerManager.getCell({
            containerUuid,
            rowIndex: this.metadata.rowIndex,
            rowUid: this.metadata.rowUid,
            columnName
          })
          // types `decimal` and `date` is a object struct
          if ((getTypeOfValue(value) === 'OBJECT') && !isEmptyValue(value.type)) {
            return value.value
          }
          return value
        }

        // main panel values
        let value = this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName
        })
        if (this.isMultipleValues) {
          // List with elements in Date not working
          // if (!isEmptyValue(value)) {
          //   return value.map(val => new Date(val))
          // }
          // types `decimal` and `date` is a object struct
          if ((getTypeOfValue(value) === 'OBJECT') && !isEmptyValue(value.type)) {
            return value.value
          }
          return value
        }
        if (!this.isRenderRange) {
          return this.parseValue(value)
        }

        const valueTo = this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName: this.metadata.columnNameTo
        })

        value = this.parseValue([value, valueTo])
        return value
      },
      set(value) {
        const { columnName, containerUuid, inTable } = this.metadata
        const valueParam = value
        // table records values
        if (inTable) {
          // implement container manager row
          const value = this.containerManager.setCell({
            containerUuid,
            rowIndex: this.metadata.rowIndex,
            rowUid: this.metadata.rowUid,
            columnName,
            value: valueParam
          })
          // types `decimal` and `date` is a object struct
          if ((getTypeOfValue(value) === 'OBJECT') && !isEmptyValue(value.type)) {
            return value.value
          }
          return value
        }

        let startValue, endValue
        startValue = value

        if (this.isRenderRange && !this.metadata.inTable && Array.isArray(value)) {
          startValue = value.at(0)
          endValue = value.at(1)
        }

        if (startValue === null) {
          startValue = undefined
          endValue = undefined
        }

        this.$store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName,
          value: startValue
        })

        if (!this.isRenderRange) {
          return
        }
        this.$store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName: this.metadata.columnNameTo,
          value: endValue
        })
      }
    }
  },

  methods: {
    parseValue(valueToParse) {
      let currentValue = valueToParse
      // types `decimal` and `date` is a object struct
      if ((getTypeOfValue(valueToParse) === 'OBJECT') && !isEmptyValue(valueToParse.type)) {
        currentValue = valueToParse.value
      }

      // not return undefined to v-model
      if (isEmptyValue(currentValue)) {
        if (this.isMultipleValues) {
          return []
        }
        return null
      }

      if (this.isMultipleValues) {
        if (Array.isArray(currentValue)) {
          currentValue = currentValue.map(itemValue => {
            if (typeof itemValue === 'object') {
              return itemValue.toUTCString()
            }
            return itemValue
          })
        } else {
          const tempValue = []
          if (!isEmptyValue(currentValue)) {
            tempValue.push(currentValue)
          }
          currentValue = tempValue
        }
        return currentValue
      }

      // instance date from long value
      if (typeof currentValue === 'number') {
        currentValue = new Date(currentValue).toUTCString()
      }

      // generate range value
      if (this.isRenderRange && !this.metadata.inTable) {
        let valueTo
        let value = currentValue
        if (Array.isArray(value)) {
          valueTo = value.at(1)
          value = value.at(0)
        }
        if (typeof valueTo === 'number') {
          valueTo = new Date(valueTo).toUTCString()
        }
        if (isEmptyValue(valueTo)) {
          valueTo = undefined
        }
        currentValue = [value, valueTo]
        if (isEmptyValue(currentValue.at(0)) || isEmptyValue(currentValue.at(1))) {
          currentValue = []
        }
      }

      return currentValue
    },
    // validate values before send values to store or server
    preHandleChange(value) {
      let startValue, endValue
      startValue = value
      if (this.typePicker === 'dates') {
        if (Array.isArray(value)) {
          value = value.map(itemValue => new Date(itemValue))
        }
        this.handleFieldChange({ value })
        return
      }

      if (this.isRenderRange && !this.metadata.inTable && Array.isArray(value)) {
        startValue = value.at(0)
        endValue = value.at(1)
      }

      if (startValue === null) {
        startValue = undefined
        endValue = undefined
      }

      if (typeof startValue !== 'object' && startValue !== undefined) {
        startValue = new Date(startValue)
        endValue = new Date(endValue)
      }
      this.handleFieldChange({
        value: startValue,
        valueTo: endValue
      })
    }
  }
}
</script>

<style lang="scss">
  .custom-field-date {
    width: 100% !important;
  }
</style>
