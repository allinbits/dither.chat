<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import AppPage from '~/components/AppPage.vue';
import { Card, CardContent, CardHeader, Button, Badge } from '~/components/ui';
import { retrieveLaunchParams, initData, useSignal } from '@tma.js/sdk-vue';

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
      <!-- Welcome Card -->
      <Card class="w-full max-w-md mx-auto">
        <CardHeader class="text-center">
          <div class="mb-4">
            <div class="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <span class="text-2xl">🌐</span>
            </div>
            <h1 class="text-3xl font-bold text-foreground mb-2">Welcome to Dither!</h1>
            <p class="text-muted-foreground leading-relaxed">
              Access the Dither decentralized social network through Telegram.
            </p>
          </div>
        </CardHeader>
        <CardContent class="text-center space-y-4">
          <div class="text-sm text-muted-foreground">
            <p class="mb-2">🚀 Quick Start:</p>
            <ul class="text-left space-y-1">
              <li>• Browse latest posts</li>
              <li>• Search for content</li>
              <li>• Connect your wallet</li>
              <li>• Interact with posts</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <!-- Navigation Cards -->
      <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <!-- Feed Navigation -->
        <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToFeed">
          <CardContent class="p-4 text-center">
            <div class="text-2xl mb-2">📱</div>
            <h3 class="font-semibold text-sm">Feed</h3>
            <p class="text-xs text-muted-foreground">Latest posts</p>
          </CardContent>
        </Card>

        <!-- Search Navigation -->
        <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToSearch">
          <CardContent class="p-4 text-center">
            <div class="text-2xl mb-2">🔍</div>
            <h3 class="font-semibold text-sm">Search</h3>
            <p class="text-xs text-muted-foreground">Find content</p>
          </CardContent>
        </Card>

        <!-- Wallet Navigation -->
        <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToWallet">
          <CardContent class="p-4 text-center">
            <div class="text-2xl mb-2">🔗</div>
            <h3 class="font-semibold text-sm">Wallet</h3>
            <p class="text-xs text-muted-foreground">Connect wallet</p>
          </CardContent>
        </Card>

        <!-- User Navigation -->
        <Card class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateToUser">
          <CardContent class="p-4 text-center">
            <div class="text-2xl mb-2">👤</div>
            <h3 class="font-semibold text-sm">Profile</h3>
            <p class="text-xs text-muted-foreground">User profiles</p>
          </CardContent>
        </Card>
      </div>

      <!-- Quick Actions -->
      <Card class="w-full max-w-md mx-auto">
        <CardHeader>
          <h3 class="text-lg font-semibold text-foreground">⚡ Quick Actions</h3>
        </CardHeader>
        <CardContent class="space-y-3">
          <Button 
            @click="navigateToFeed" 
            class="w-full justify-start"
            variant="outline"
          >
            📱 View Latest Posts
          </Button>
          <Button 
            @click="navigateToSearch" 
            class="w-full justify-start"
            variant="outline"
          >
            🔍 Search Content
          </Button>
          <Button 
            @click="navigateToWallet" 
            class="w-full justify-start"
            variant="outline"
          >
            🔗 Connect Wallet
          </Button>
        </CardContent>
      </Card>

      <!-- Status Section -->
      <Card class="w-full max-w-md mx-auto">
        <CardHeader>
          <h3 class="text-lg font-semibold text-foreground">📊 Status</h3>
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

      <!-- Help Section -->
      <Card class="w-full max-w-md mx-auto">
        <CardHeader>
          <h3 class="text-lg font-semibold text-foreground">💡 Help</h3>
        </CardHeader>
        <CardContent class="space-y-2">
          <p class="text-sm text-muted-foreground">
            Use the navigation cards above to explore Dither features.
          </p>
          <p class="text-sm text-muted-foreground">
            Connect your wallet to interact with posts and create content.
          </p>
        </CardContent>
      </Card>
    </div>
  </AppPage>
</template>
