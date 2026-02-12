// 封装购物车模块
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useUserStore } from './userStore'
import { insertCartAPI, delCartAPI, findNewCartListAPI } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()
  const isLogin = computed(() => userStore.userInfo.token)
  //获取最新购物车
  const updateNewList = async () => {
    const res = await findNewCartListAPI()
    cartList.value = res.result
  }
  // 1. 定义state - cartList
  const cartList = ref([])
  // 2. 定义action - addCart
  const addCart = async (goods) => {
    const { skuId, count } = goods
    if (isLogin.value) {
      await insertCartAPI({ skuId, count })
      updateNewList()
    }
    // 思路：通过匹配传递过来的商品对象中的skuId能不能在cartList中找到，找到了就是添加过
    const item = cartList.value.find((item) => goods.skuId === item.skuId)
    if (item) {
      // 找到了
      item.count += count
    } else {
      // 没找到
      cartList.value.push(goods)
    }
  }
  // 删除购物车
  const delCart = async (skuId) => {
    if (isLogin.value) {
      await delCartAPI([skuId])
      updateNewList()
    } else {
      // 思路：
      // 1. 找到要删除项的下标值 - splice
      // 2. 使用数组的过滤方法 - filter
      const idx = cartList.value.findIndex((item) => skuId === item.skuId)
      cartList.value.splice(idx, 1)
    }

  }
  //单选功能
  const singleCheck = (skuId, selected) => {
    const item = cartList.value.find(item => item.skuId === skuId)
    item.selected = selected
  }
  //全选功能
  const allCheck = (selected) => {
    cartList.value.forEach(item => item.selected = selected)
  }
  //计算什么时候全选
  const isAll = computed(() => {
    if (cartList.value.length === 0) return false
    return cartList.value.every(item => item.selected)
  })
  //计算我已经选择的数量
  const selectedCount = computed(() => cartList.value.filter(item => item.selected).reduce(((a, c) => a + c.count), 0))
  //计算价钱总和
  const selectedPrice = computed(() => cartList.value.filter(item => item.selected).reduce((a, c) => a + c.count * c.price, 0))
  //计算属性计算总的数量，总的价值
  const allCount = computed(() => cartList.value.reduce((a, c) => a + c.count, 0))
  const allPrice = computed(() => cartList.value.reduce((a, c) => a + c.price * c.count, 0))

  return {
    cartList,
    addCart,
    delCart,
    singleCheck,
    allCheck,
    isAll,
    selectedCount,
    selectedPrice,
    updateNewList,
    allCount,
    allPrice
  }
}, {
  persist: true,
})
