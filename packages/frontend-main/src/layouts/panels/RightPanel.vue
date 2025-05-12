<script setup lang="ts">

</script>

<template>
  <!-- TODO: Make right menu -->
  <!-- This should probably stick -->
  <aside class="flex flex-col max-w-[358px] h-full p-5 overflow-y-auto fixed left-[calc(50%+(var(--main-max-width)/2))] border-l border-neutral-200">
    <ToggleThemeButton/>
    <input placeholder="search" class="bg-neutral-200 p-2 w-full" />
  </aside>
</template>
