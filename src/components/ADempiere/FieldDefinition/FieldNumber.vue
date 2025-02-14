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
  <el-tooltip
    v-model="isShowed"
    manual
    :content="valueToDisplay"
    placement="top"
    effect="light"
  >
    <el-input-number
      v-if="isFocus"
      :ref="metadata.columnName"
      key="number-input-focus"
      v-model="value"
      v-shortkey="shortcutKeys"
      v-bind="commonsProperties"
      type="number"
      :min="minValue"
      :max="maxValue"
      :controls="isShowControls"
      :controls-position="controlsPosition"
      autofocus
      :size="sizeField"
      @change="preHandleChange"
      @focus="focusGained"
      @blur="customFocusLost"
      @keydown.native="keyPressed"
      @keyup.native="keyReleased"
      @shortkey.native="keyPressField"
      @keyup.native.enter="actionKeyEnter"
    />

    <el-input
      v-else
      key="number-displayed-blur"
      v-model="displayedValue"
      v-bind="commonsProperties"
      readonly
      autofocus
      :size="sizeField"
      @focus="customFocusGained"
    />
  </el-tooltip>
</template>

<script>
import store from '@/store'

// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'

// Constants
import { INPUT_NUMBER_PATTERN } from '@/utils/ADempiere/formatValue/numberFormat.js'
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'
import {
  NUMBER
} from '@/utils/ADempiere/references.js'
import { CURRENCY } from '@/utils/ADempiere/constants/systemColumns'

// Utils and Helper Methods
import { isAmountDecimalField, isNumberField } from '@/utils/ADempiere/references.js'
import { formatNumber } from '@/utils/ADempiere/formatValue/numberFormat.js'
import { getTypeOfValue, isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { standardPrecisionContext } from '@/utils/ADempiere/formatValue/numberFormat.js'

export default {
  name: 'FieldNumber',

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
      isFocus: false,
      valueToDisplay: '',
      isShowed: false
    }
  },

  computed: {
    cssClassCustomField() {
      return ' custom-field-number '
    },
    maxValue() {
      if (isEmptyValue(this.metadata.valueMax)) {
        // Number.POSITIVE_INFINITY
        return Infinity
      }
      return Number(this.metadata.valueMax)
    },
    minValue() {
      if (isEmptyValue(this.metadata.valueMin)) {
        // Number.NEGATIVE_INFINITY
        return -Infinity
      }
      return Number(this.metadata.valueMin)
    },
    precision() {
      // Amount, Costs+Prices, Number, Quantity
      const {
        precision,
        parentUuid,
        display_type,
        containerUuid
      } = this.metadata
      if (!isEmptyValue(precision)) {
        return precision
      }
      if (display_type === NUMBER.id) {
        return standardPrecisionContext({
          parentUuid: parentUuid,
          containerUuid: containerUuid
        })
      }
      if (isAmountDecimalField(display_type)) {
        // return store.getters.getStandardPrecision
        return store.getters['user/getCurrencyPrecision'].standard_precision
      }
      if (isNumberField(display_type)) {
        // return store.getters.getStandardPrecision
        return store.getters['user/getUOMPrecision'].standard_precision
      }
      return undefined
    },
    isShowControls() {
      if (!isEmptyValue(this.metadata.showControl)) {
        if (this.metadata.showControl === 0) {
          return false
        }
      }
      return true
    },
    controlsPosition() {
      if (!isEmptyValue(this.metadata.showControl)) {
        // show side controls
        if (this.metadata.showControl === 1) {
          return undefined
        }
      }
      // show right controls
      return 'right'
    },
    displayedValue: {
      set(newValue) {
      },
      get() {
        return formatNumber({
          value: this.value,
          displayType: this.metadata.display_type,
          currency: this.currencyCode,
          precision: this.precision
        })
      }
    },
    currencyDocument() {
      const columnName = DISPLAY_COLUMN_PREFIX + CURRENCY
      // table records values
      if (this.metadata.inTable) {
        // implement container manager row
        const value = this.containerManager.getCell({
          containerUuid: this.metadata.containerUuid,
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

      const value = this.$store.getters.getValueOfField({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.firstTabUuid,
        columnName
      })
      // types `decimal` and `date` is a object struct
      if ((getTypeOfValue(value) === 'OBJECT') && !isEmptyValue(value.type)) {
        return value.value
      }
      return value
    },
    currencyCode() {
      if (!isEmptyValue(this.metadata.labelCurrency)) {
        return this.metadata.labelCurrency
      }
      const documentCurrency = this.currencyDocument
      if (!isEmptyValue(documentCurrency)) {
        return documentCurrency
      }
      // const currencyIsoCode = store.getters.getCurrencyCode
      // if (!isEmptyValue(currencyIsoCode)) {
      //   return currencyIsoCode
      // }
      return undefined
    },
    shortcutKeys() {
      const alphabet = {
        a: ['a'], A: ['A'], b: ['b'], B: ['B'], c: ['c'], C: ['C'], d: ['d'], D: ['D'],
        e: ['e'], E: ['E'], f: ['f'], F: ['F'], g: ['g'], G: ['G'], h: ['h'], H: ['H'],
        i: ['i'], I: ['I'], j: ['j'], J: ['J'], k: ['k'], K: ['K'], l: ['l'], L: ['L'], m: ['m'], M: ['M'], n: ['n'], N: ['N'],
        o: ['o'], O: ['O'], p: ['p'], P: ['P'], q: ['q'], Q: ['Q'], r: ['r'], R: ['R'], s: ['s'], S: ['S'], t: ['t'], T: ['T'],
        u: ['u'], U: ['U'], v: ['v'], V: ['V'], w: ['w'], W: ['W'], x: ['x'], X: ['X'], y: ['y'], Y: ['Y'], z: ['z'], Z: ['Z']
      }

      // generate new object
      const alphabetWithShift = Object.keys(alphabet).reduce((acc, item, index) => {
        acc[index] = [
          'shift',
          item.at()
        ]
        return acc
      }, {})

      return {
        ...alphabet,
        ...alphabetWithShift,
        close: ['esc']
      }
    }
  },

  methods: {
    keyPressField(event) {
      switch (event.srcKey) {
        case 'close':
          this.customFocusLost(event)
          break
      }

      // if (!isEmptyValue(this.$refs[this.metadata.columnName])) {
      //   this.$refs[this.metadata.columnName].handleBlur()
      //   this.preHandleChange(this.$refs[this.metadata.columnName].currentValue)
      // }
    },
    parseValue(valueToParse) {
      let currentValue = valueToParse
      // types `decimal` and `date` is a object struct
      if ((getTypeOfValue(valueToParse) === 'OBJECT') && !isEmptyValue(valueToParse.type)) {
        currentValue = valueToParse.value
      }

      if (isEmptyValue(currentValue)) {
        return undefined
      }
      return Number(currentValue)
    },
    customFocusGained(event) {
      if (this.metadata.readonly) {
        this.isFocus = false
        return
      }
      this.isFocus = true
      // this.focusGained(event)
      this.$nextTick(() => {
        // this.$refs[this.metadata.columnName].focus()
        if (!isEmptyValue(this.$refs) && !isEmptyValue(this.$refs[this.metadata.columnName])) {
          this.$refs[this.metadata.columnName].select()
        }
      })
    },
    actionKeyEnter(event) {
      // this.$nextTick(() => {
      //   if (!isEmptyValue(this.$refs) && !isEmptyValue(this.$refs[this.metadata.columnName])) {
      //     this.$refs[this.metaedata.columnName].select()
      //   }
      // })
      this.actionKeyPerformed(event)
    },
    customFocusLost(event) {
      this.focusLost(event)

      // to change value first
      setTimeout(() => {
        this.isFocus = false
      }, 100)
    },
    validateInput(event) {
      const value = String(event.target.value)
        .replace(INPUT_NUMBER_PATTERN, '')
      this.value = value
    }
  }
}
</script>

<style lang="scss" scoped>
  /* Show input width 100% in container */
  .el-input-number, .el-input {
    width: 100% !important; /* ADempiere Custom */
  }
</style>
<style lang="scss">
.custom-field-number {
  &.el-input-number, &.el-input {
    .el-input__inner {
      text-align-last: end !important;
    }
  }
}
</style>
