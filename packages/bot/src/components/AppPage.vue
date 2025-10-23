<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '~/components/ui';
import { HomeIcon } from 'lucide-vue-next';

const router = useRouter();

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="page">
    <!-- Header with navigation -->
    <div class="page__header">
      <div class="page__title-section">
        <h1 class="page__title">
          <slot name="title">{{ title }}</slot>
        </h1>
        <div v-if="disclaimer" class="page__disclaimer">{{ disclaimer }}</div>
      </div>
      
      <!-- Navigation buttons -->
      <div class="page__nav">
        <Button 
          v-if="back" 
          @click="goBack" 
          variant="outline" 
          size="sm"
          class="page__nav-button"
        >
          ← Back
        </Button>
        <Button 
          @click="goHome" 
          variant="outline" 
          size="sm"
          class="page__nav-button"
        >
          <HomeIcon class="w-4 h-4 mr-1" />
          Home
        </Button>
      </div>
    </div>
    
    <!-- Page content -->
    <div class="page__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #e0e0e0);
}

.page__title-section {
  flex: 1;
  min-width: 0;
}

.page__title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
  color: var(--tg-theme-text-color, #000000);
  word-break: break-word;
}

.page__disclaimer {
  font-size: 14px;
  color: var(--tg-theme-hint-color, #666666);
  margin-bottom: 16px;
}

.page__nav {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
}

.page__nav-button {
  font-size: 12px;
  padding: 6px 12px;
}

.page__content {
  flex: 1;
}

@media (max-width: 480px) {
  .page__header {
    flex-direction: column;
    gap: 12px;
  }
  
  .page__nav {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>