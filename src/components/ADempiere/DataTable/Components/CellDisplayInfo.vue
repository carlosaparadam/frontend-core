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
  <span :class="cellCssClass">
    <document-status-tag
      v-if="fieldAttributes.isColumnDocumentStatus"
      key="document-status"
      size="small"
      :value="cellValue"
      :displayed-value="displayedValue"
    />

    <!-- <progress-percentage
      v-else-if="isPercentageColumn"
      key="percentage-status"
      :value="cellValue"
      :displayed-value="displayedValue"
    /> -->

    <p
      v-else-if="!isEmptyValue(displayedValue) && displayedValue.length >= 23 && fieldAttributes.display_type != IMAGE.id"
      key="display-column"
      style="max-height: 40px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap; margin: 5px;"
    >
      <el-popover
        placement="top-start"
        width="300"
        trigger="hover"
        :open-delay="400"
      >
        <el-row>
          <el-col :span="24" style="word-break: normal;">
            <el-button
              type="text"
              style="padding: 0px 8px;"
              icon="el-icon-document-copy"
              @click="copyContent(displayedValue)"
            />

            <div
              v-if="(!isEmptyValue(displayedValue) && fieldAttributes.componentPath === TEXT_LONG.componentPath)"
              v-markdown="displayedValue"
            />
            <template v-else>
              {{ displayedValue }}
            </template>
          </el-col>
        </el-row>
        <el-row slot="reference">
          <el-col :span="24" style="max-height: 40px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            {{ displayedValue }}
          </el-col>
        </el-row>
      </el-popover>
    </p>

    <span v-else>
      <div
        v-if="(!isEmptyValue(displayedValue) && fieldAttributes.componentPath === TEXT_LONG.componentPath)"
        v-markdown="displayedValue"
      />

      <el-popover
        v-else-if="(!isEmptyValue(displayedValue) && fieldAttributes.componentPath === IMAGE.componentPath)"
        v-model="isPreviewImage"
        placement="left"
        width="300"
        trigger="hover"
        :open-delay="400"
      >
        <el-image
          v-if="isPreviewImage"
          class="image-file"
          :src="imageSourceMedium"
          lazy
          fit="contain"
        >
          <!-- <div slot="placeholder" class="image-loading">
            {{ $t('notifications.loading') }}<span class="dot">...</span>
          </div> -->
          <el-skeleton
            slot="placeholder"
            :loading="true"
            animated
            :throttle="500"
            class="image-loading"
          >
            <template slot="template">
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 140px;"
              />
            </template>
          </el-skeleton>
        </el-image>

        <img
          slot="reference"
          :src="imageSourceSmall"
          width="25px"
          height="25px"
        >
      </el-popover>

      <p v-else key="only-value" style="margin: 5px;">
        {{ displayedValue }}
      </p>
    </span>
  </span>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

// Components and Mixins
import DocumentStatusTag from '@/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'
import FieldDefinition from '@/components/ADempiere/FieldDefinition/index.vue'
import ProgressPercentage from '@/components/ADempiere/ContainerOptions/ProgressPercentage.vue'

// Utils and helpers Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { copyToClipboard } from '@/utils/ADempiere/coreUtils.js'
import { formatField } from '@/utils/ADempiere/valueFormat.js'
import { getImagePath } from '@/utils/ADempiere/resource'
import { isNumberField } from '@/utils/ADempiere/references'
import { standardPrecisionContext } from '@/utils/ADempiere/formatValue/numberFormat.js'

// Constants
import { IMAGE, TEXT_LONG } from '@/utils/ADempiere/references'
import { CURRENCY } from '@/utils/ADempiere/constants/systemColumns'
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'

export default defineComponent({
  name: 'CellDisplayInfo',

  components: {
    DocumentStatusTag,
    FieldDefinition,
    ProgressPercentage
  },

  props: {
    fieldAttributes: {
      type: Object,
      required: true
    },
    dataRow: {
      type: Object,
      default: () => {}
    }
  },

  setup(props) {
    const isPreviewImage = ref(false)

    const columnName = computed(() => {
      if (!isEmptyValue(props.fieldAttributes.column_name)) {
        return props.fieldAttributes.column_name
      }
      return props.fieldAttributes.columnName
    })
    // const elementName = computed(() => {
    //   return props.fieldAttributes.element_name
    // })
    const displayColumnName = computed(() => {
      return props.fieldAttributes.displayColumnName
    })

    const cellValue = computed(() => {
      return props.dataRow[columnName.value]
    })

    const defaulPrecisions = computed(() => {
      return standardPrecisionContext({
        parentUuid: props.fieldAttributes.parentUuid,
        containerUuid: props.fieldAttributes.containerUuid
      })
    })

    const displayedValue = computed(() => {
      if (props.fieldAttributes.is_encrypted) {
        return '••••••••••••••••••'
      }
      const currentValue = props.dataRow[columnName.value]
      return formatField({
        value: currentValue,
        currency: props.dataRow[DISPLAY_COLUMN_PREFIX + CURRENCY],
        displayedValue: props.dataRow[displayColumnName.value],
        displayType: props.fieldAttributes.display_type,
        columnName: columnName.value,
        precision: defaulPrecisions.value
      })
    })

    const cellCssClass = computed(() => {
      let classCss = ''
      if (isNumberField(props.fieldAttributes.display_type) || props.fieldAttributes.componentPath === 'FieldNumber') {
        classCss = ' cell-align-right '
      }
      if (props.fieldAttributes.isColumnDocumentStatus || props.fieldAttributes.display_type === IMAGE.id) {
        classCss = ' cell-align-center '
      }
      return classCss
    })

    const imageSourceSmall = computed(() => {
      const displayedAlt = displayedValue.value
      if (isEmptyValue(displayedAlt)) {
        return undefined
      }
      const { uri } = getImagePath({
        file: displayedAlt,
        width: 20,
        height: 20
      })
      return uri
    })

    const imageSourceMedium = computed(() => {
      const displayedAlt = displayedValue.value
      if (isEmptyValue(displayedAlt)) {
        return undefined
      }
      const { uri } = getImagePath({
        file: displayedAlt,
        width: 400,
        height: 400
      })
      return uri
    })

    // const isPercentageColumn = computed(() => {
    //   return [columnName.value, elementName.value].includes('TaskStatus')
    // })

    function copyContent(value) {
      copyToClipboard({
        text: value,
        isShowMessage: true
      })
    }

    return {
      columnName,
      displayColumnName,
      // data
      // isPercentageColumn,
      IMAGE,
      TEXT_LONG,
      // Computeds
      cellValue,
      cellCssClass,
      displayedValue,
      isPreviewImage,
      imageSourceSmall,
      defaulPrecisions,
      imageSourceMedium,
      // Methods
      copyContent
    }
  }
})
</script>
