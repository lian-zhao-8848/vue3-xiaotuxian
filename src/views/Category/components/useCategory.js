import { ref, onMounted } from "vue"
import { getTopCategoryAPI } from '@/api/category'
import { useRoute } from 'vue-router'
import { onBeforeRouteUpdate } from 'vue-router'
//封装分类业务代码
export function useCategory() {
  //获取我的数据
  const categoryData = ref({})
  const route = useRoute()
  const getCategory = async (id = route.params.id) => {
    const res = await getTopCategoryAPI(id)
    categoryData.value = res.result
  }
  onMounted(() => { getCategory(route.params.id) })

  //路由参数变化的时候，分类数据接口可以重新发送
  onBeforeRouteUpdate((to) => {
    // console.log("路由变化了", to);
    getCategory(to.params.id)
  })
  return {
    categoryData
  }
}

