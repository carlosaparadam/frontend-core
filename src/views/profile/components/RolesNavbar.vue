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
  <el-form>
    <!-- <label> <b> {{ $t('route.client') }} </b> </label> -->
    <!-- <el-input
      v-model="storedRole.client.name"
      disabled
    /> -->
    <label>
      <el-tag
        style="width: 100%;text-align: center;"
      >
        <b style="font-size: 14px;">
          {{ userName.name }}
        </b>
      </el-tag>
    </label>
    <label>
      <el-tag
        style="width: 100%;text-align: center;"
      >
        <b style="font-size: 14px;">
          {{ storedRole.client.name }}
        </b>
      </el-tag>
    </label>

    <label> <b> {{ $t('route.role') }} </b> </label>
    <el-select
      v-model="currentRoleId"
      :filterable="isFiltrable"
      value-key="key"
    >
      <el-option
        v-for="(role, key) in rolesList"
        :key="key"
        :label="role.name"
        :value="role.id"
      />
    </el-select>

    <label> <b> {{ $t('route.organization') }} </b> </label>
    <el-select
      v-model="currentOrganizationId"
      :filterable="isFiltrable"
      value-key="key"
      @visible-change="showOrganizationsList"
    >
      <el-option
        v-for="(organization, key) in organizationsList"
        :key="key"
        :label="organization.name"
        :value="organization.id"
      />
    </el-select>

    <label> <b> {{ $t('route.warehouse') }} </b> </label>
    <el-select
      v-model="currentWarehouseId"
      :filterable="isFiltrable"
      value-key="key"
      @visible-change="showWarehouseList"
    >
      <el-option
        v-for="(warehouse, key) in warehousesList"
        :key="key"
        :label="warehouse.name"
        :value="warehouse.id"
      />
    </el-select>
  </el-form>
</template>

<script>
export default {
  name: 'RolesNavbar',

  computed: {
    languagesList() {
      return this.$store.getters.getLanguagesList
    },
    storedRole() {
      return this.$store.getters['user/getRole']
    },
    userName() {
      return this.$store.getters['user/userInfo']
    },
    currentRoleId: {
      get() {
        return this.storedRole.id
      },
      set(roleToSet) {
        this.changeRole(roleToSet)
      }
    },
    rolesList() {
      return this.$store.getters['user/getRoles']
    },
    currentOrganizationId: {
      get() {
        const organization = this.$store.getters['user/getOrganization']
        if (organization) {
          return organization.id
        }
        return -1
      },
      set(organizationToSet) {
        this.changeOrganization(organizationToSet)
      }
    },
    currentRole() {
      return this.$store.getters['user/getRole']
    },
    organizationsList() {
      return this.$store.getters['user/getOrganizations']
    },
    currentWarehouseId: {
      get() {
        const warehouse = this.$store.getters['user/getWarehouse']
        if (warehouse) {
          return warehouse.id
        }
        return -1
      },
      set(warehouseToSet) {
        this.changeWarehouse(warehouseToSet)
      }
    },
    warehousesList() {
      return this.$store.getters['user/getWarehouses']
    },
    isFiltrable() {
      return this.$store.state.app.device !== 'mobile'
    }
  },

  created() {
    this.getLanguages()
  },

  methods: {
    changeRole(roleId) {
      this.$message({
        message: this.$t('notifications.loading'),
        iconClass: 'el-icon-loading'
      })
      this.$store.dispatch('user/changeRole', {
        roleId,
        organizationId: this.currentOrganizationId,
        warehouseId: this.warehouseId
      })
        .finally(() => {
          this.refreshRouter()
          // location.reload(true)
        })
    },
    changeOrganization(organizationId) {
      this.$message({
        message: this.$t('notifications.loading'),
        showClose: true,
        iconClass: 'el-icon-loading'
      })
      this.$store.dispatch('user/changeOrganization', {
        organizationId
      })
        .finally(() => {
          this.refreshRouter()
        })
    },
    showOrganizationsList(isShow) {
      if (isShow && this.isEmptyValue(this.organizationsList)) {
        this.$store.dispatch('user/getOrganizationsListFromServer', this.currentRoleId)
      }
    },
    changeWarehouse(warehouseId) {
      this.$store.dispatch('user/changeWarehouse', {
        warehouseId
      })
    },
    showWarehouseList(isShow) {
      if (isShow && this.isEmptyValue(this.warehousesList)) {
        this.$store.dispatch('user/getWarehousesList', {
          organizationId: this.currentOrganizationId
        })
      }
    },
    getLanguages() {
      if (this.isEmptyValue(this.languageList)) {
        this.$store.dispatch('getLanguagesFromServer')
      }
    },
    refreshRouter() {
      const view = {
        fullPath: '/dashboard',
        meta: {
          affix: true,
          breadcrumb: false,
          icon: 'dashboard',
          isIndex: true,
          title: 'dashboard'
        },
        name: 'Dashboard',
        path: '/dashboard',
        title: 'dashboard'
      }

      this.$store.dispatch('tagsView/delCachedView', view)
        .then(() => {
          this.$nextTick(() => {
            this.$router.replace({
              path: '/redirect' + '/dashboard'
            })
          })
        })
        .finally(() => {
          this.$store.dispatch('getDashboardListFromServer')
          this.$store.dispatch('listPendingDocuments')
        })
    }
  }
}
</script>

<style scoped>
label {
  font-weight: 400;
  display: block;
  margin-top: 5%;
}
</style>
