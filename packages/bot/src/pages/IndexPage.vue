<script setup lang="ts">
import { computed } from 'vue';
import { routes } from '@/router';
import AppPage from '@/components/AppPage.vue';
import AppLink from '@/components/AppLink.vue';
import { Button, Card, CardContent, CardHeader } from '@/components/ui';

const ditherRoutes = computed(() => 
  routes.filter((r) => ['feed', 'search'].includes(r.name as string))
);

const devRoutes = computed(() => 
  routes.filter((r) => ['init-data', 'theme-params', 'launch-params', 'ton-connect'].includes(r.name as string))
);
</script>

<template>
  <AppPage title="🌐 Dither Bot" :back="false">
    <Card class="mb-6">
      <CardHeader class="text-center">
        <h2 class="text-2xl font-bold mb-3 text-foreground">Welcome to Dither!</h2>
        <p class="text-muted-foreground leading-relaxed">
          Access the Dither decentralized social network through Telegram. 
          Browse posts, search content, and interact with the community.
        </p>
      </CardHeader>
    </Card>

    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-4 text-foreground">🚀 Quick Start</h3>
      <div class="space-y-2">
        <Button 
          v-for="route in ditherRoutes" 
          :key="route.name"
          variant="default"
          size="lg"
          class="w-full justify-start"
          @click="$router.push({ name: route.name })"
        >
          {{ route.meta!.title }}
        </Button>
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-4 text-foreground">🔧 Development</h3>
      <div class="space-y-2">
        <Button 
          v-for="route in devRoutes" 
          :key="route.name"
          variant="outline"
          size="lg"
          class="w-full justify-start"
          @click="$router.push({ name: route.name })"
        >
          <i v-if="route.meta?.icon" class="w-5 h-5 mr-2 flex-shrink-0">
            <component :is="route.meta.icon" />
          </i>
          {{ route.meta!.title }}
        </Button>
      </div>
    </div>
  </AppPage>
</template>
