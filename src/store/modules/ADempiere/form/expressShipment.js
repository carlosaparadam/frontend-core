/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import lang from '@/lang'

// API Request Methods
import {
  listProductRequest,
  // Shipment
  createShipmentRequest,
  processShipmentRequest,
  // Shipment Line
  createShipmentLineRequest,
  updateShipmentLineRequest,
  deleteShipmentLineRequest,
  listShipmentLinesRequest
} from '@/api/ADempiere/form/express-shipment.js'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification.js'

const expressShipment = {
  currentShipment: {},
  listProduct: [],
  listShipmentLines: [],
  listOrdes: [],
  currentOrder: {}
}

export default {
  state: expressShipment,
  mutations: {
    setListProduct(state, list) {
      state.listProduct = list
    },
    setListShipmentLines(state, list) {
      state.listShipmentLines = list
    },
    setCurrentShipment(state, current) {
      state.currentShipment = current
    },
    setListOrdersShipment(state, list) {
      state.listOrdes = list
    },
    setCurrentOrdersShipment(state, list) {
      state.currentOrder = list
    }
  },
  actions: {
    listProductsShipment({ commit }, {
      namue,
      upc,
      searchValue,
      sku,
      value,
      orderId
    }) {
      return new Promise(resolve => {
        listProductRequest({
          namue,
          upc,
          searchValue,
          sku,
          value,
          orderId
        })
          .then(response => {
            const { records } = response
            commit('setListProduct', records)
            resolve(records)
          })
          .catch(error => {
            resolve([])
            commit('setListProduct', [])
            console.warn(`Error getting List Product: ${error.message}. Code: ${error.code}.`)
          })
      })
    },
    listLine({ commit }, {
      shipmentId,
      shipmentUuid
    }) {
      listShipmentLinesRequest({
        shipmentId,
        shipmentUuid
      })
        .then(response => {
          let list = []
          const { records } = response
          if (!isEmptyValue(records)) {
            list = records.map(line => {
              return {
                ...line,
                isEditQuantity: false
              }
            })
          }
          commit('setListShipmentLines', list)
        })
        .catch(error => {
          console.warn(`Error getting List Product: ${error.message}. Code: ${error.code}.`)
        })
    },
    // Shipment Line
    createLine({ state, getters, dispatch }, {
      productId,
      productUuid,
      description,
      isQuantityFromOrderLine,
      quantity = 1
    }) {
      const { id, uuid } = getters.getCurrentExpressShipment
      createShipmentLineRequest({
        shipmentId: id,
        shipmentUuid: uuid,
        isQuantityFromOrderLine,
        description,
        quantity,
        productId,
        productUuid
      })
        .then(response => {
          dispatch('listLine', {
            shipmentId: id,
            shipmentUuid: uuid
          })
        })
        .catch(error => {
          showMessage({
            type: 'error',
            message: error.message,
            showClose: true
          })
          console.warn(`Error Getting Update Shipment Line: ${error.message}. Code: ${error.code}.`)
        })
    },
    updateLine({ commit, dispatch, getters }, {
      id,
      uuid,
      description,
      quantity
    }) {
      updateShipmentLineRequest({
        id,
        uuid,
        description,
        quantity
      })
        .then(response => {
          const { id, uuid } = getters.getCurrentExpressShipment
          dispatch('listLine', {
            shipmentId: id,
            shipmentUuid: uuid
          })
        })
        .catch(error => {
          let message = error.message
          if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
            message = error.response.data.message
          }
          showMessage({
            type: 'error',
            message,
            showClose: true
          })
          console.warn(`Error Getting Update Shipment Line: ${error.message}. Code: ${error.code}.`)
          const { id, uuid } = getters.getCurrentExpressShipment
          dispatch('listLine', {
            shipmentId: id,
            shipmentUuid: uuid
          })
        })
    },
    deleteLine({ dispatch, getters }, {
      id,
      uuid
    }) {
      // const { id, uuid } = getters.getCurrentExpressShipment
      deleteShipmentLineRequest({
        shipmentId: getters.getCurrentExpressShipment.id,
        id,
        uuid
      })
        .then(response => {
          const { id, uuid } = getters.getCurrentExpressShipment
          dispatch('listLine', {
            shipmentId: id,
            shipmentUuid: uuid
          })
        })
        .catch(error => {
          showMessage({
            type: 'error',
            message: error.message,
            showClose: true
          })
          console.warn(`Error Getting Update Shipment Line: ${error.message}. Code: ${error.code}.`)
        })
    },
    // Shipment
    createShipment({ commit, dispatch }, {
      id,
      uuid
    }) {
      createShipmentRequest({
        id,
        uuid
      })
        .then(response => {
          const { id, uuid } = response
          commit('setCurrentShipment', response)
          dispatch('listLine', {
            shipmentId: id,
            shipmentUuid: uuid
          })
        })
        .catch(error => {
          showMessage({
            type: 'error',
            message: error.message,
            showClose: true
          })
          console.warn(`Error Getting Update Shipment Line: ${error.message}. Code: ${error.code}.`)
        })
    },
    processShipment({ commit, dispatch, getters }) {
      const { id, uuid } = getters.getCurrentExpressShipment
      return new Promise(resolve => {
        processShipmentRequest({
          id,
          uuid
        })
          .then(response => {
            const { id, uuid } = response
            dispatch('listLine', {
              shipmentId: id,
              shipmentUuid: uuid
            })
            commit('setCurrentShipment', response)
            resolve(response)
            showMessage({
              type: 'success',
              message: lang.t('form.expressShipment.shipmentComplete'),
              showClose: true
            })
          })
          .catch(error => {
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }
            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            console.warn(`Error Getting Update Shipment Line: ${error.message}. Code: ${error.code}.`)
          })
      })
    }
  },
  getters: {
    getListProductShipment(state) {
      return state.listProduct
    },
    getListShipmentLines(state) {
      return state.listShipmentLines
    },
    getCurrentExpressShipment(state) {
      return state.currentShipment
    },
    getListOrdersShipment(state) {
      return state.listOrdes
    },
    getCurrentOrdersShipment(state) {
      return state.currentOrder
    }
  }
}
