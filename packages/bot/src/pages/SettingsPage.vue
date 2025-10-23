<script setup lang="ts">
import { ref } from 'vue';
import AppPage from '~/components/AppPage.vue';
import { Button, Input, Textarea, Card, CardContent, CardHeader, FormItem, FormLabel, FormControl, FormMessage, Field, FieldLabel, FieldContent, FieldError } from '~/components/ui';
import { SettingsIcon, UserIcon, BellIcon, ShieldIcon } from 'lucide-vue-next';

// Form data
const formData = ref({
  username: '',
  bio: '',
  notifications: true,
  privacy: 'public'
});

const errors = ref<Record<string, string>>({});

const handleSubmit = () => {
  // Clear previous errors
  errors.value = {};
  
  // Simple validation
  if (!formData.value.username.trim()) {
    errors.value.username = 'Username is required';
  }
  
  if (formData.value.bio.length > 500) {
    errors.value.bio = 'Bio must be less than 500 characters';
  }
  
  // If no errors, submit
  if (Object.keys(errors.value).length === 0) {
    console.log('Form submitted:', formData.value);
    // Handle form submission here
  }
};

const handleReset = () => {
  formData.value = {
    username: '',
    bio: '',
    notifications: true,
    privacy: 'public'
  };
  errors.value = {};
};
</script>

<template>
  <AppPage title="Settings" :back="true">
    <template #title>
      <div class="flex items-center gap-2">
        <SettingsIcon class="w-5 h-5" />
        Settings
      </div>
    </template>
    
    <div class="w-full space-y-6">
      <!-- Profile Settings -->
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <UserIcon class="w-5 h-5" />
            <h3 class="text-lg font-semibold">Profile Settings</h3>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input 
                v-model="formData.username" 
                placeholder="Enter your username"
                :class="{ 'border-destructive': errors.username }"
              />
            </FormControl>
            <FormMessage v-if="errors.username" class="text-destructive">
              {{ errors.username }}
            </FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea 
                v-model="formData.bio" 
                placeholder="Tell us about yourself..."
                :class="{ 'border-destructive': errors.bio }"
              />
            </FormControl>
            <FormMessage v-if="errors.bio" class="text-destructive">
              {{ errors.bio }}
            </FormMessage>
            <p class="text-xs text-muted-foreground">
              {{ formData.bio.length }}/500 characters
            </p>
          </FormItem>
        </CardContent>
      </Card>

      <!-- Notification Settings -->
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <BellIcon class="w-5 h-5" />
            <h3 class="text-lg font-semibold">Notifications</h3>
          </div>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal">
            <FieldLabel>Enable notifications</FieldLabel>
            <FieldContent>
              <input 
                v-model="formData.notifications" 
                type="checkbox" 
                class="rounded border-input"
              />
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      <!-- Privacy Settings -->
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <ShieldIcon class="w-5 h-5" />
            <h3 class="text-lg font-semibold">Privacy</h3>
          </div>
        </CardHeader>
        <CardContent>
          <Field orientation="vertical">
            <FieldLabel>Profile visibility</FieldLabel>
            <FieldContent>
              <select 
                v-model="formData.privacy" 
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="public">Public</option>
                <option value="friends">Friends only</option>
                <option value="private">Private</option>
              </select>
            </FieldContent>
            <FieldError v-if="errors.privacy" class="text-destructive">
              {{ errors.privacy }}
            </FieldError>
          </Field>
        </CardContent>
      </Card>

      <!-- Form Actions -->
      <div class="flex gap-3">
        <Button @click="handleSubmit" class="flex-1">
          Save Settings
        </Button>
        <Button @click="handleReset" variant="outline" class="flex-1">
          Reset
        </Button>
      </div>
    </div>
  </AppPage>
</template>
