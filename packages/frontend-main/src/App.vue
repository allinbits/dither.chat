<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
    <div class="flex flex-col w-screen h-screen overflow-x-hidden overflow-y-auto items-center">
        <div class="flex flex-row w-full h-full justify-center max-w-[1280px]">
            <div class="flex flex-col p-6 h-full w-[380px] gap-6">
                <!-- This should probably stick -->
                <div class="text-2xl">Dither</div>
                <Button size="lg">Connect</Button>
            </div>
            <div class="flex flex-col border-x border-neutral-200 h-full grow min-w-[600px]">
                <!-- Fill with Feed -->
                <div class="sticky min-w-[600px] min-h-full top-0">
                    Yea, this isn't really ready.
                    <div v-for="i in 1000" :key="i">
                        {{ i }}
                    </div>
                </div>
            </div>
            <div class="flex flex-col w-[380px] p-6 h-full">
                <!-- This should probably stick -->
                <input placeholder="search" class="bg-neutral-200 p-2 w-full" />
            </div>
        </div>
    </div>
</template>
