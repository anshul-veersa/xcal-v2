<template>
  <div
    ref="markerRef"
    class="current-time-marker"
    :style="{ top: markerPosition, '--bead-offset': (beadAt ?? 0) * 100 + '%' }"
  >
    <span>{{ t.format(now, "HH:mm") }}</span>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, inject, onUnmounted, ref, watch } from "vue";
import { TimeUtils } from "@/core/time";
import { areOverlapping } from "@/core/utils";

const props = defineProps<{
  beadAt: number;
  hideSelectorsOnOverlap?: string[];
}>();

const t = inject<TimeUtils>("time_utils")!;

const markerRef = ref<HTMLElement>();

const now = ref(t.now);
const timerId = setInterval(() => {
  now.value = t.now;
}, 1000);
onUnmounted(() => {
  clearInterval(timerId);
});

const markerPosition = computed(() => {
  const start = t.startOfDay(now.value);

  const elapsedMinutes = (+now.value - +start) / (1000 * 60);
  return `${((elapsedMinutes / 1440) * 100).toFixed(1)}%`;
});

function hideOverlappingSelectors() {
  if (!markerRef.value) return;

  const elementsToHide =
    props.hideSelectorsOnOverlap?.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector))
    ) ?? [];

  const markerTime = markerRef.value.querySelector("span");

  elementsToHide.forEach((element) => {
    const overlap = areOverlapping(markerTime!, element);

    if (overlap) {
      (element as HTMLElement).style.visibility = "hidden";
    }
  });
}

watch(
  [markerRef, markerPosition],
  () => {
    hideOverlappingSelectors();
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.current-time-marker {
  --marker-color: #e22828ac;

  height: 2px;
  width: calc(100% + 5px);
  background-color: var(--marker-color);
  transform: translateX(-5px);
  position: absolute;

  &::before {
    content: "";
    position: absolute;
    left: var(--bead-offset);
    top: 50%;
    transform: translateY(-50%);
    border-radius: 100px;
    width: 10px;
    height: 10px;
    background-color: var(--marker-color);
  }

  span {
    color: var(--marker-color);
    font-weight: 500;
    position: absolute;
    top: 50%;
    left: -48px;
    transform: translateY(-50%);
    font-size: 14px;
  }
}
</style>
