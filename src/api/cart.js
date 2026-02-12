import request from '@/utils/http'
// 加入购物车
export const insertCartAPI = ({ skuId, count }) => {
  return request({
    url: '/member/cart',
    method: 'POST',
    data: {
      skuId,
      count
    }
  })
}
// 删除购物车
export const delCartAPI = (ids) => {
  return request({
    url: '/member/cart',
    method: 'DELETE',
    data: {
      ids
    }
  })
}
//获取最新的购物车列表
export const findNewCartListAPI = () => {
  return request({
    url: '/member/cart'
  })
}
//添加收货地址
export const addAddressAPI = (data) => {
  return request({
    url: '/member/address',
    method: 'POST',
    data
  })
}
// 删除收货地址接口
export const deleteAddressAPI = (id) => {
  return request({
    url: `/member/address/${id}`,
    method: 'DELETE'
  })
}
