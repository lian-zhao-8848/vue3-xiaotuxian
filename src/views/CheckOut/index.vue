<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue';
//引入俩接口
import { getCheckoutInfoAPI, creatOrderAPI } from '@/api/checkout';
//创建路由跳转
import { useRouter } from 'vue-router';
const router = useRouter()
//购物车模块
import { useCartStore } from '@/stores/cartStore';
const cartStore = useCartStore()
//引入添加地址
import { addAddressAPI } from '@/api/cart';
import { regionData, codeToText } from 'element-china-area-data'
//删除购物车
import { deleteAddressAPI } from '@/api/cart';
//定义添加的弹框显示
const addFlag = ref(false)
// 表单数据对象
const addressForm = ref({
  receiver: '',
  contact: '',
  provinceCode: '', // 省编码
  cityCode: '',     // 市编码
  countyCode: '',   // 区编码
  address: '',      // 详细地址
  postalCode: '1',   // 邮政编码（可选）
  addressTags: '家', // 地址标签
  isDefault: 0,     // 0: 非默认, 1: 默认 (根据接口文档调整)
  fullLocation: ''  // 完整地址字符串 "xx省 xx市 xx区"
})
// 级联选择器绑定的值 (数组形式)
const selectedCity = ref([])

// 监听城市选择变化
const handleChange = () => {
  // selectedCity.value 是一个数组: ['110000', '110100', '110101']
  if (selectedCity.value && selectedCity.value.length === 3) {
    // 1. 拆解编码赋给表单
    addressForm.value.provinceCode = selectedCity.value[0]
    addressForm.value.cityCode = selectedCity.value[1]
    addressForm.value.countyCode = selectedCity.value[2]

    // 2. 利用 codeToText 将编码转为汉字，拼接成 fullLocation
    const province = codeToText[selectedCity.value[0]]
    const city = codeToText[selectedCity.value[1]]
    const county = codeToText[selectedCity.value[2]]
    addressForm.value.fullLocation = `${province} ${city} ${county}`
  }
}

// 提交表单
const confirmAdd = async () => {
  const phoneReg = /^1\d{10}$/

  if (!phoneReg.test(addressForm.value.contact)) {
    return ElMessage.warning('请输入以1开头的11位有效手机号')
  }
  // 简单的非空校验
  if (!addressForm.value.receiver || !addressForm.value.contact || !addressForm.value.fullLocation || !addressForm.value.address) {
    return ElMessage.warning('请填写完整信息')
  }
  try {
    // 调用你封装的接口
    await addAddressAPI(addressForm.value)

    ElMessage.success('添加成功')
    addFlag.value = false // 关闭弹窗

    // !!! 关键：调用你之前的 getCheckInfo 函数刷新列表 !!!
    await getCheckInfo()

    // 重置表单 (可选)
    addressForm.value = { receiver: '', contact: '', isDefault: 0, fullLocation: '' }
    selectedCity.value = []
  } catch (error) {
    console.error(error)
    ElMessage.error('添加失败')
  }
}

const checkInfo = ref({})  // 订单对象
const curAddress = ref({})  // 地址对象
const getCheckInfo = async () => {
  const res = await getCheckoutInfoAPI()
  checkInfo.value = res.result
  const item = checkInfo.value.userAddresses.find(item => item.isDefault === 1)
  curAddress.value = item
}
onMounted(() => getCheckInfo())
//控制弹框打开
const showDialog = ref(false)
//切换地址
const activeAddress = ref({})
const switchAddress = (item) => {
  activeAddress.value = item
}
//确认收货地址
const confirm = () => {
  showDialog.value = false
  curAddress.value = activeAddress.value
  activeAddress.value = {}
}
//删除购物车逻辑
const onDeleteAddress = (id) => {
  ElMessageBox.confirm(
    '确认要删除该收货地址吗',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 1. 调用接口删除
      await deleteAddressAPI(id)
      ElMessage.success('删除成功')
      // 2. 重新获取结算信息，刷新地址列表
      await getCheckInfo()

      // 3. 特殊处理：如果删掉的是当前选中的地址，需要清空当前选中
      if (curAddress.value.id === id) {
        curAddress.value = {}
      }
    } catch (error) {
      console.log(error);
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

//下面送货弹框
const deliveryIndex = ref(0)
//支付弹框
const payIndex = ref(0)




//提交订单
const creatOrder = async () => {
  const res = await creatOrderAPI({
    deliveryTimeType: 1,
    payType: 1,
    payChannel: 1,
    buyerMessage: '多辣多麻酱',
    goods: checkInfo.value.goods.map(item => {
      return {
        skuId: item.skuId,
        count: item.count
      }
    }),
    addressId: curAddress.value.id
  })
  const orderId = res.result.id
  router.push({
    path: '/pay',
    query: {
      id: orderId
    }
  })
  //更新我们的购物车
  cartStore.updateNewList()
}








</script>

<template>
  <div class="xtx-pay-checkout-page">
    <div class="container">
      <div class="wrapper">
        <!-- 收货地址 -->
        <h3 class="box-title">收货地址</h3>
        <div class="box-body">
          <div class="address">
            <div class="text">
              <div class="none" v-if="!curAddress">您需要先添加收货地址才可提交订单。</div>
              <ul v-else>
                <li><span>收货人：</span>{{ curAddress.receiver }}</li>
                <li><span>联系方式：</span>{{ curAddress.contact }}</li>
                <li><span>收货地址：</span>{{ curAddress.fullLocation }} {{ curAddress.address }}</li>
              </ul>
            </div>
            <div class="action">
              <el-button size="large" @click="showDialog = true">切换地址</el-button>
              <el-button size="large" @click="addFlag = true">添加地址</el-button>
            </div>
          </div>
        </div>
        <!-- 商品信息 -->
        <h3 class="box-title">商品信息</h3>
        <div class="box-body">
          <table class="goods">
            <thead>
              <tr>
                <th width="520">商品信息</th>
                <th width="170">单价</th>
                <th width="170">数量</th>
                <th width="170">小计</th>
                <th width="170">实付</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in checkInfo.goods" :key="i.id">
                <td>
                  <a href="javascript:;" class="info">
                    <img :src="i.picture" alt="">
                    <div class="right">
                      <p>{{ i.name }}</p>
                      <p>{{ i.attrsText }}</p>
                    </div>
                  </a>
                </td>
                <td>&yen;{{ i.price }}</td>
                <td>{{ i.price }}</td>
                <td>&yen;{{ i.totalPrice }}</td>
                <td>&yen;{{ i.totalPayPrice }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 配送时间 -->
        <h3 class="box-title">配送时间</h3>
        <div class="box-body">
          <a class="my-btn " href="javascript:;" :class="{ active: deliveryIndex === 0 }"
            @click="deliveryIndex = 0">不限送货时间：周一至周日</a>
          <a class="my-btn" href="javascript:;" :class="{ active: deliveryIndex === 1 }"
            @click="deliveryIndex = 1">工作日送货：周一至周五</a>
          <a class="my-btn" href="javascript:;" :class="{ active: deliveryIndex === 2 }"
            @click="deliveryIndex = 2">双休日、假日送货：周六至周日</a>
        </div>
        <!-- 支付方式 -->
        <h3 class="box-title">支付方式</h3>
        <div class="box-body">
          <a class="my-btn " href="javascript:;" :class="{ active: payIndex === 0 }" @click="payIndex = 0">在线支付</a>
          <a class="my-btn" href="javascript:;" :class="{ active: payIndex === 1 }" @click="payIndex = 1">货到付款</a>
          <span :style="{ color: ' skyblue', fontWeight: '700', fontSize: '20px' }">货到付款需付5元手续费</span>
        </div>
        <!-- 金额明细 -->
        <h3 class="box-title">金额明细</h3>
        <div class="box-body" v-if="checkInfo.summary">
          <div class="total">
            <dl>
              <dt>商品件数：</dt>
              <dd>{{ checkInfo.summary?.goodsCount }}件</dd>
            </dl>
            <dl>
              <dt>商品总价：</dt>
              <dd>¥{{ checkInfo.summary?.totalPrice.toFixed(2) }}</dd>
            </dl>
            <dl>
              <dt>运<i></i>费：</dt>
              <dd>¥{{ checkInfo.summary?.postFee.toFixed(2) }}</dd>
            </dl>
            <dl>
              <dt>应付总额：</dt>
              <dd class="price">{{ checkInfo.summary?.totalPayPrice.toFixed(2) }}</dd>
            </dl>
          </div>
        </div>
        <!-- 提交订单 -->
        <div class="submit">
          <el-button type="primary" size="large" @click="creatOrder">提交订单</el-button>
        </div>
      </div>
    </div>
  </div>
  <!-- 切换地址 -->
  <el-dialog title="切换收货地址" width="30%" center v-model="showDialog">
    <div class="addressWrapper">
      <div class="text item" v-for="item in checkInfo.userAddresses" :key="item.id"
        :class="{ active: activeAddress.id === item.id }" @click="switchAddress(item)">
        <ul>
          <li><span>收货人：</span>{{ item.receiver }} </li>
          <li><span>联系方式：</span>{{ item.contact }}</li>
          <li><span>收货地址：</span>{{ item.fullLocation + item.address }}</li>
        </ul>
        <a href="javascript:;" class="del-btn" @click.stop="onDeleteAddress(item.id)">删除</a>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button>取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 添加地址 -->
  <el-dialog v-model="addFlag" title="添加收货地址" width="30%" center>
    <el-form :model="addressForm" label-width="80px">
      <el-form-item label="收货人">
        <el-input v-model="addressForm.receiver" placeholder="请输入收货人" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="addressForm.contact" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="地区">
        <el-cascader v-model="selectedCity" :options="regionData" placeholder="请选择省/市/区" style="width: 100%"
          @change="handleChange" />
      </el-form-item>

      <el-form-item label="详细地址">
        <el-input v-model="addressForm.address" placeholder="街道、楼牌号等" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addFlag = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.xtx-pay-checkout-page {
  margin-top: 20px;

  .wrapper {
    background: #fff;
    padding: 0 20px;

    .box-title {
      font-size: 16px;
      font-weight: normal;
      padding-left: 10px;
      line-height: 70px;
      border-bottom: 1px solid #f5f5f5;
    }

    .box-body {
      padding: 20px 0;
    }
  }
}

.address {
  border: 1px solid #f5f5f5;
  display: flex;
  align-items: center;

  .text {
    flex: 1;
    min-height: 90px;
    display: flex;
    align-items: center;

    .none {
      line-height: 90px;
      color: #999;
      text-align: center;
      width: 100%;
    }

    >ul {
      flex: 1;
      padding: 20px;

      li {
        line-height: 30px;

        span {
          color: #999;
          margin-right: 5px;

          >i {
            width: 0.5em;
            display: inline-block;
          }
        }
      }
    }

    >a {
      color: $xtxColor;
      width: 160px;
      text-align: center;
      height: 90px;
      line-height: 90px;
      border-right: 1px solid #f5f5f5;
    }
  }

  .action {
    width: 420px;
    text-align: center;

    .btn {
      width: 140px;
      height: 46px;
      line-height: 44px;
      font-size: 14px;

      &:first-child {
        margin-right: 10px;
      }
    }
  }
}

.goods {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;

  .info {
    display: flex;
    text-align: left;

    img {
      width: 70px;
      height: 70px;
      margin-right: 20px;
    }

    .right {
      line-height: 24px;

      p {
        &:last-child {
          color: #999;
        }
      }
    }
  }

  tr {
    th {
      background: #f5f5f5;
      font-weight: normal;
    }

    td,
    th {
      text-align: center;
      padding: 20px;
      border-bottom: 1px solid #f5f5f5;

      &:first-child {
        border-left: 1px solid #f5f5f5;
      }

      &:last-child {
        border-right: 1px solid #f5f5f5;
      }
    }
  }
}

.my-btn {
  width: 228px;
  height: 50px;
  border: 1px solid #e4e4e4;
  text-align: center;
  line-height: 48px;
  margin-right: 25px;
  color: #666666;
  display: inline-block;

  &.active,
  &:hover {
    border-color: $xtxColor;
  }
}

.total {
  dl {
    display: flex;
    justify-content: flex-end;
    line-height: 50px;

    dt {
      i {
        display: inline-block;
        width: 2em;
      }
    }

    dd {
      width: 240px;
      text-align: right;
      padding-right: 70px;

      &.price {
        font-size: 20px;
        color: $priceColor;
      }
    }
  }
}

.submit {
  text-align: right;
  padding: 60px;
  border-top: 1px solid #f5f5f5;
}

.addressWrapper {
  max-height: 500px;
  overflow-y: auto;

  .item {
    position: relative;

    .del-btn {
      position: absolute;
      top: 15px;
      right: 30px;
      color: red;

      &:hover {
        font-size: large;
      }

    }
  }
}

.text {
  flex: 1;
  min-height: 90px;
  display: flex;
  align-items: center;

  &.item {
    border: 1px solid #f5f5f5;
    margin-bottom: 10px;
    cursor: pointer;

    &.active,
    &:hover {
      border-color: $xtxColor;
      background: lighten($xtxColor, 50%);
    }

    >ul {
      padding: 10px;
      font-size: 14px;
      line-height: 30px;
    }
  }
}
</style>
