<script setup>
import router from '@/router';
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore()
const Todoconfirm = () => {
  // 退出登录业务逻辑实现
  // 1.清除用户信息 触发action
  userStore.clearUsetInfo()
  // 2.跳转到登录页
  router.push('/login')
}
</script>

<template>
  <nav class="app-topnav">
    <div class="container">
      <ul>
        <template v-if="true">
          <li><a href="javascript:;"><i class=" iconfont icon-user"></i>仁者无敌</a></li>
          <li>
            <el-popconfirm @confirm="Todoconfirm" title="确认退出?" confirm-button-text="确认" cancel-button-text="取消">
              <template #reference>
                <a href="javascript:;">退出登录</a>
              </template>
            </el-popconfirm>
          </li>
          <li><a href="javascript:;">我的订单</a></li>
          <li><a href="javascript:;">会员中心</a></li>
        </template>
        <template v-else>
          <li><a href="javascript:;" @click="router.push('/login')">请先登录</a></li>
          <li><a href="javascript:;">帮助中心</a></li>
          <li><a href="javascript:;">关于我们</a></li>
        </template>
      </ul>
    </div>
  </nav>
</template>


<style scoped lang="scss">
.app-topnav {
  background: #333;

  ul {
    display: flex;
    height: 53px;
    //主轴水平方向默认从右边开始对齐，左边的logo，右边是订单栏什么的
    justify-content: flex-end;
    align-items: center;

    li {
      a {
        padding: 0 15px;
        color: #cdcdcd;
        line-height: 1;
        display: inline-block;

        i {
          font-size: 14px;
          margin-right: 2px;
        }

        &:hover {
          color: $xtxColor;
        }
      }

      //设置左边框线的时候，不是所有的都需要设置，~的意思是说除了第一个li之外的所有li标签，选中然后去设置
      ~li {
        a {
          border-left: 2px solid #666;
        }
      }
    }
  }
}
</style>
