<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import AppPage from '~/components/AppPage.vue';
import { Card, CardContent, CardHeader, Button, Badge } from '~/components/ui';
import { retrieveLaunchParams, initData, useSignal } from '@tma.js/sdk-vue';
import { SmartphoneIcon, SearchIcon, LinkIcon, UserIcon, ZapIcon, BarChart3Icon } from 'lucide-vue-next';

// Router for navigation
const router = useRouter();

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

// Navigation handlers
const navigateToFeed = () => {
  router.push('/feed');
};

const navigateToSearch = () => {
  router.push('/search');
};

const navigateToWallet = () => {
  router.push('/ton-connect');
};

const navigateToUser = () => {
  // For demo purposes, navigate to a sample user
  router.push('/user/cosmos1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz');
};
</script>

<template>
  <AppPage title="🌐 Dither Bot" :back="false">
    <div class="min-h-screen p-4 space-y-6">
      <!-- Navigation Cards -->
      <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <!-- Feed Navigation -->
        <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToFeed">
          <CardContent class="p-4 text-center">
            <div class="text-2xl mb-2"><SmartphoneIcon class="w-8 h-8 mx-auto" /></div>
            <h3 class="font-semibold text-sm">Feed</h3>
            <p class="text-xs text-muted-foreground">Latest posts</p>
          </CardContent>
        </Card>

        <!-- Search Navigation -->
        <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToSearch">
          <CardContent class="p-4 text-center">
            <div class="text-2xl mb-2"><SearchIcon class="w-8 h-8 mx-auto" /></div>
            <h3 class="font-semibold text-sm">Search</h3>
            <p class="text-xs text-muted-foreground">Find content</p>
          </CardContent>
        </Card>

        <!-- Wallet Navigation -->
        <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToWallet">
          <CardContent class="p-4 text-center">
            <div class="text-2xl mb-2"><LinkIcon class="w-8 h-8 mx-auto" /></div>
            <h3 class="font-semibold text-sm">Wallet</h3>
            <p class="text-xs text-muted-foreground">Connect wallet</p>
          </CardContent>
        </Card>

        <!-- User Navigation -->
        <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToUser">
          <CardContent class="p-4 text-center">
            <div class="text-2xl mb-2"><UserIcon class="w-8 h-8 mx-auto" /></div>
            <h3 class="font-semibold text-sm">Profile</h3>
            <p class="text-xs text-muted-foreground">User profiles</p>
          </CardContent>
        </Card>
      </div>

      <!-- Status Section -->
      <Card class="w-full max-w-md mx-auto">
        <CardHeader>
          <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3Icon class="w-5 h-5" />
            Status
          </h3>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Telegram:</span>
            <Badge variant="default">✅ Connected</Badge>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Platform:</span>
            <Badge variant="outline">{{ platformInfo.platform }}</Badge>
          </div>
          <div v-if="userInfo" class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">User:</span>
            <span class="text-sm font-medium">{{ userInfo.name }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Dither API:</span>
            <Badge variant="secondary">🔄 Connecting...</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </AppPage>
</template>
