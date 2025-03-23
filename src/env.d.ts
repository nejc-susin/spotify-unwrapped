/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  export interface GlobalComponents {
    RouterLink: typeof import('vue-router')['RouterLink']
    RouterView: typeof import('vue-router')['RouterView']
  }
}

declare function defineProps<T>(): Readonly<T>
declare function defineEmits<T>(): T

// Add missing Vue exports
declare module 'vue' {
  export { ref, computed, onMounted, nextTick, defineComponent } from '@vue/runtime-core'
} 