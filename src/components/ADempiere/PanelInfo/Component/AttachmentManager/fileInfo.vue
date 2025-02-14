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
    v-model="isShowed"
    placement="bottom"
    trigger="click"
  >
    <el-skeleton v-if="isLoading" :rows="5" animated />

    <el-descriptions v-else class="margin-top" :column="1" border>
      <el-descriptions-item :label="$t('component.attachment.fileName')">
        {{ infoImage.name }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('component.attachment.fileSize')">
        {{ formatFileSize(infoImage.size) }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('component.attachment.fileFormat')">
        {{ infoImage.content_type }}
      </el-descriptions-item>

      <!-- <el-descriptions-item :label="$t('component.attachment.description')">
        {{ resourceReference.description }}
      </el-descriptions-item> -->
      <!-- <el-descriptions-item :label="$t('component.attachment.message')">
        {{ resourceReference.text_message }}
      </el-descriptions-item> -->
    </el-descriptions>

    <el-button
      slot="reference"
      icon="el-icon-info"
      plain
    />
  </el-popover>
</template>

<script>
import { defineComponent, ref, watch } from '@vue/composition-api'

// API Request Methods
import {
  requestGetResourceReference
} from '@/api/ADempiere/file-management/resource-reference.ts'

// Utils and Helper Methods
import { isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils'
import { formatFileSize } from '@/utils/ADempiere/resource.js'

export default defineComponent({
  name: 'FileInfo',

  props: {
    file: {
      type: Object,
      default: () => {}
    },
    id: {
      type: Number,
      default: -1
    },
    uuid: {
      type: String,
      default: undefined
    },
    resourceName: {
      type: String,
      default: undefined
    },
    imageId: {
      type: Number,
      default: -1
    },
    imageUuid: {
      type: String,
      default: undefined
    },
    archiveId: {
      type: Number,
      default: -1
    },
    archiveUuid: {
      type: String,
      default: undefined
    },
    isEditDescription: {
      type: Boolean,
      default: false
    },
    infoImage: {
      type: Object,
      default: undefined
    }
  },

  setup(props) {
    const isLoading = ref(false)
    const isShowed = ref(false)
    const emptyRespourceRefence = {
      name: 'unknown',
      fileSize: 0,
      contextType: 'application/unknown',
      description: '',
      textMessage: '',
      update: -1,
      created: -1
    }

    const resourceReference = ref(emptyRespourceRefence)

    function getResourceReference() {
      isLoading.value = true
      requestGetResourceReference({
        id: props.id,
        resourceName: props.resourceName,
        //
        imageId: props.imageId,
        //
        archiveId: props.archiveId
      })
        .then(response => {
          resourceReference.value = response
        })
        .catch(error => {
          console.warn(error)
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    if (isEmptyValue(props.file)) {
      if (isShowed.value) {
        getResourceReference()
      }
    } else {
      resourceReference.value = props.file
    }

    watch(isShowed, (newValue) => {
      if (newValue && resourceReference.value.fileSize === 0) {
        getResourceReference()
      }
    })

    watch(() => props.resourceName, (newValue, oldValue) => {
      if (!isSameValues(newValue, oldValue)) {
        resourceReference.value = emptyRespourceRefence
      }
    })

    return {
      isLoading,
      isShowed,
      resourceReference,
      // Methods
      formatFileSize
    }
  }
})
</script>
