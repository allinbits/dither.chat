<script setup lang="ts">
import AppPage from '@/components/AppPage.vue';
import { Card, CardContent, CardHeader } from '@/components/ui';
</script>

<template>
  <AppPage title="🌐 Dither Bot" :back="false">
    <div class="min-h-screen flex items-center justify-center p-4">
      <Card class="w-full max-w-md">
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
    </div>
  </AppPage>
</template>
