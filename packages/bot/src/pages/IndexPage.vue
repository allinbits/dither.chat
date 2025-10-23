<script setup lang="ts">
import { computed } from 'vue';
import AppPage from '@/components/AppPage.vue';
import { Card, CardContent, CardHeader, Badge } from '@/components/ui';
import { retrieveLaunchParams, initData, useSignal } from '@tma.js/sdk-vue';

// TMA.js SDK integration - basic info display
const launchParams = retrieveLaunchParams();
const platform = launchParams.tgWebAppPlatform || 'unknown';
const version = launchParams.tgWebAppVersion || 'unknown';

// Get user information using the correct pattern
const initDataRef = useSignal(initData.state);

// Platform info
const platformInfo = {
  platform: platform.charAt(0).toUpperCase() + platform.slice(1),
  version
};

// User information
const userInfo = computed(() => {
  const user = initDataRef.value?.user;
  if (!user) return null;
  
  return {
    name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
    username: user.username,
    id: user.id,
    language: user.language_code,
    isPremium: user.is_premium
  };
});
</script>

<template>
  <AppPage title="🌐 Dither Bot" :back="false">
    <div class="min-h-screen p-4 space-y-6">
      <!-- Welcome Card -->
      <Card class="w-full max-w-md mx-auto">
        <CardHeader class="text-center">
          <div class="mb-4">
            <div class="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <span class="text-2xl">🌐</span>
            </div>
            <h1 class="text-3xl font-bold text-foreground mb-2">Welcome to Dither!</h1>
            <p class="text-muted-foreground leading-relaxed">
              Your gateway to the decentralized social network.
            </p>
          </div>
        </CardHeader>
        <CardContent class="text-center">
          <p class="text-sm text-muted-foreground">
            More features coming soon...
          </p>
        </CardContent>
      </Card>

      <!-- Telegram User Info -->
      <Card v-if="userInfo" class="w-full max-w-md mx-auto">
        <CardHeader>
          <h3 class="text-lg font-semibold text-foreground">👤 Telegram User</h3>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Name:</span>
            <span class="text-sm font-medium">{{ userInfo.name }}</span>
          </div>
          <div v-if="userInfo.username" class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Username:</span>
            <span class="text-sm font-medium">@{{ userInfo.username }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">ID:</span>
            <span class="text-sm font-medium">{{ userInfo.id }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Language:</span>
            <Badge variant="secondary">{{ userInfo.language }}</Badge>
          </div>
          <div v-if="userInfo.isPremium" class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Premium:</span>
            <Badge variant="default">⭐ Premium</Badge>
          </div>
        </CardContent>
      </Card>

      <!-- Platform Info -->
      <Card class="w-full max-w-md mx-auto">
        <CardHeader>
          <h3 class="text-lg font-semibold text-foreground">📱 Platform</h3>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Platform:</span>
            <Badge variant="outline">{{ platformInfo.platform }}</Badge>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Version:</span>
            <span class="text-sm font-medium">{{ platformInfo.version }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- TMA.js SDK Status -->
      <Card class="w-full max-w-md mx-auto">
        <CardHeader>
          <h3 class="text-lg font-semibold text-foreground">🔧 TMA.js SDK</h3>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Status:</span>
            <Badge variant="default">✅ Connected</Badge>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Integration:</span>
            <span class="text-sm font-medium">Basic</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </AppPage>
</template>
