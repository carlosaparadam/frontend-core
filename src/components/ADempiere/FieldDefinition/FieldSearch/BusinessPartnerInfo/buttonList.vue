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
  <el-popover
    ref="businessPartnerListPopover"
    v-model="showedPopoverPanel"
    popper-class="business-partners-popover"
    placement="top"
    width="900"
    trigger="click"
  >
    <panel-form
      v-if="showedPopoverPanel"
      :show-popover="showedPopoverPanel"
      :container-manager="containerManager"
      :metadata="parentMetadata"
    />

    <el-button
      slot="reference"
      class="button-show-popover"
      :disabled="isDisabled"
    >
      <i
        class="el-icon-user-solid"
      />
    </el-button>
  </el-popover>
</template>

<script>
import store from '@/store'

// Components and Mixins
import PanelForm from './PanelForm/index.vue'
// import BusinessPartnerPanel from './businessPartnersList.vue'

// Constants
import {
  BUSINESS_PARTNERS_LIST_FORM,
  COLUMN_NAME
} from '@/utils/ADempiere/dictionary/field/search/businessPartner.ts'

export default {
  name: 'ButtonBusinessPartnersList',

  components: {
    PanelForm
  },

  props: {
    parentMetadata: {
      type: Object,
      default: () => {
        return {
          parentUuid: undefined,
          containerUuid: undefined,
          columnName: COLUMN_NAME,
          elementName: COLUMN_NAME
        }
      }
    },
    containerManager: {
      type: Object,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    uuidForm() {
      if (!this.isEmptyValue(this.parentMetadata.containerUuid)) {
        return this.parentMetadata.columnName + '_' + this.parentMetadata.containerUuid
      }
      return BUSINESS_PARTNERS_LIST_FORM
    },
    showedPopoverPanel: {
      get() {
        return store.getters.getBPShow({
          containerUuid: this.uuidForm
        })
      },
      set(value) {
        store.commit('setBusinessPartnerShow', {
          containerUuid: this.uuidForm,
          show: value
        })
      }
    }
  }
}
</script>
