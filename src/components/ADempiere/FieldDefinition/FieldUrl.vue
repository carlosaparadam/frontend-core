<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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
  <el-input
    v-model="value"
    v-bind="commonsProperties"
    :pattern="pattern"
    :maxlength="maxLength"
    :autofocus="metadata.inTable"
    show-word-limit
    @change="preHandleChange"
    @blur="focusLost"
    @focus="focusGained"
    @keydown.native="keyPressed"
    @keyup.native="keyReleased"
    @keyup.native.enter="actionKeyPerformed"
    @submit="false"
  >
    <el-button
      slot="append"
      class="button-show-popover"
      @click="redirectToUrl"
    >
      <svg-icon icon-class="travel-explore" />
    </el-button>
  </el-input>
</template>

<script>
// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldMixinText from '@/components/ADempiere/FieldDefinition/mixin/mixinFieldText.js'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'FieldUrl',

  mixins: [
    fieldMixin,
    fieldMixinText
  ],
  props: {
    inTable: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      default: undefined
    }
  },

  data() {
    return {
      // url pattern
      patternValidate: '((ht|f)tp(s?)\:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)'
    }
  },
  computed: {
    cssClassCustomField() {
      return ' custom-field-url '
    },

    validText() {
      if (isEmptyValue(this.value)) {
        return true
      }
      if (isEmptyValue(this.patternValidate)) {
        return true
      }
      return (new RegExp(this.patternValidate)).test(this.value)
    },

    maxLength() {
      if (!isEmptyValue(this.metadata.fieldLength) && this.metadata.fieldLength > 0) {
        return Number(this.metadata.fieldLength)
      }
      return undefined
    }
  },
  methods: {
    redirectToUrl() {
      if (!isEmptyValue(this.value)) {
        window.open(this.value, '_blank')
      }
    }
  }
}
</script>

<style lang="scss">
.custom-field-url {
  max-height: 36px;
}
</style>
