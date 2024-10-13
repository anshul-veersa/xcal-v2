<template>
  <div class="column-view">
    <div class="day-layout">
      <div class="timeline-slots">
        <div
          v-for="hourIndicator in slotIndicators"
          :key="hourIndicator.key"
          style="display: contents"
        >
          <div class="hour-indicator">
            <span class="hour-indicator__label">{{ hourIndicator.label }}</span>
            <div class="hour-indicator__separator"></div>
          </div>

          <div
            v-for="slot in hourIndicator.slots"
            :key="slot.key"
            class="timeline-slot"
          ></div>
        </div>
      </div>

      <div class="timeline-overlay-layer">
        <div
          id="current-time-marker"
          :style="{ top: markerPosition }"
          ref="markerRef"
        >
          <span>{{ t.format(now, "HH:mm") }}</span>
        </div>
      </div>

      <div class="timeline-events">
        <div class="day-column" v-for="day in layoutEventTiles" :key="day.id">
          <div class="background-events-layer events-layer"></div>
          <div class="tilled-events-layer events-layer">
            <div
              v-for="tile in mappedValues"
              :key="tile.id"
              class="event-tile"
              :data-width="tile.width"
              :data-offset="tile.offset"
              :style="{
                gridRowStart: tile.start,
                gridRowEnd: tile.end,
                margin: '1px',
                marginTop: tile.start & 1 ? '1px' : '1px',
                marginBottom: tile.end & 1 ? '1px' : '1px',
                position: 'relative',
                width: `calc(${tile.width * 100 + '%'} - 2px)`,
                left: `calc(${tile.offset * 100 + '%'} + 1px)`,
              }"
            >
              <slot name="event-tile" v-bind="{ event: tile.event, tile }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, inject, onUnmounted, ref, watch } from "vue";
import type { CalendarEvent, EventTileSlotProps, SlotDuration } from "@/types";
import { TimeUtils } from "@/core/time";

export type DayViewProps = {
  events: Array<CalendarEvent<T>>;
  date: Date;
  slotDuration: SlotDuration;
};

const props = defineProps<DayViewProps>();

const t = inject<TimeUtils>("time_utils")!;

const slotIndicators = computed(() => {
  const d = new Date();
  const hours = t.eachHourOfInterval({
    start: t.startOfDay(d),
    end: t.addHours(t.endOfDay(d), 1),
  });

  const indicators = hours.map((time) => {
    return {
      key: +time,
      hour: time,
      label: t.format(time, "HH:mm"),
      slots: Array(60 / props.slotDuration)
        .fill(null)
        .map((_, i) => ({
          key: i,
          startTime: t.addMinutes(time, i * props.slotDuration),
          endTime: t.addMinutes(time, (i + 1) * props.slotDuration),
        })),
    };
  });

  indicators.at(-1)!.slots = [];

  return indicators;
});

const eventsByDay = computed(() => {
  const map: Record<string, CalendarEvent<T>[] | undefined> = {};
  props.events.forEach((e) => {
    const date = t.format(e.startsAt, "yyyy-MM-dd");
    if (!map[date]) map[date] = [];
    map[date]!.push(e);
  });
  return map;
});

const columnedEvents = computed(() => {
  const minutesInDay = 1440;
  const slotsInDay = Math.floor(minutesInDay / props.slotDuration);
  const getSlot = (time: Date) => {
    return (
      Math.floor((t.getMinutesPassedInDay(time) / minutesInDay) * slotsInDay) +
      1
    );
  };
});

type LayoutEventTiles = Array<EventTileSlotProps<T>>;
const layoutEventTiles = computed(() => {
  const minutesInDay = 1440;
  const slotsInDay = Math.floor(minutesInDay / props.slotDuration);

  const getSlot = (time: Date) => {
    return (
      Math.floor((t.getMinutesPassedInDay(time) / minutesInDay) * slotsInDay) +
      1
    );
  };

  const eventSeriesByDay = Object.entries(eventsByDay.value).map(
    ([date, events]) => {
      const sortedEvents = events;
      // !.toSorted(
      //   (e1, e2) =>
      //     getSlot(e1.startsAt) - getSlot(e2.startsAt) ||
      //     getSlot(e2.endsAt) - getSlot(e1.endsAt)
      // );

      return {
        id: date,
        events: sortedEvents!.map((event) => {
          const rowStart = getSlot(event.startsAt);
          const rowEnd = getSlot(event.endsAt);

          return {
            event: event,
            tile: {
              slot: { start: rowStart, end: rowEnd },
              continuous: {
                start: t.isBefore(event.startsAt, t.startOfDay(props.date)),
                end: t.isAfter(event.endsAt, t.endOfDay(props.date)),
              },
            },
          };
        }),
      };
    }
  );

  return eventSeriesByDay;
});

const markerRef = ref<HTMLElement>();

const now = ref(new Date());
const timerId = setInterval(() => {
  now.value = new Date();
}, 1000);
onUnmounted(() => {
  clearInterval(timerId);
});

const markerPosition = computed(() => {
  const start = t.startOfDay(now.value);

  const elapsedMinutes = (+now.value - +start) / (1000 * 60);
  return `${((elapsedMinutes / 1440) * 100).toFixed(1)}%`;
});

// [TODO]: Use CSS Grid for top to bottom placement
// and absolute positioning and % width for left to right

// Assuming events are sorted by start time and then end time in reverse
// Such that longer earlier starting events will always come earlier in line

function arrayToMap<K extends PropertyKey, T>(
  items: Array<T>,
  keySelector: (item: T, index: number) => K
): Partial<Record<K, T>> {
  const map: Partial<Record<K, T>> = {};
  items.forEach((item, i) => {
    const key = keySelector(item, i);
    map[key] = item;
  });
  return map;
}

type NodeType = {
  id: string | number;
  next: Set<NodeType>;
  back: Set<NodeType>;
};
type LongestPath = { neighbor: NodeType | null; length: number };
class PathFinder<Node extends NodeType> {
  private longestPaths: {
    forward: Map<Node["id"], LongestPath>;
    backward: Map<Node["id"], LongestPath>;
  };
  private nodesById: Partial<Record<Node["id"], Node>>;
  constructor(private readonly nodes: Node[]) {
    this.longestPaths = { forward: new Map(), backward: new Map() };

    this.nodesById = arrayToMap(nodes, (n) => n.id);
  }

  private getLongestPathNeighbor(
    node: NodeType,
    neighborKey: "next" | "back",
    cache: Map<Node["id"], LongestPath>
  ): LongestPath {
    const cachedLongestPath = cache.get(node.id);
    if (cachedLongestPath) return cachedLongestPath;

    let longestPath: LongestPath = { neighbor: null, length: 0 };
    for (let neighbor of node[neighborKey]) {
      const neighborsLongestPath = this.getLongestPathNeighbor(
        neighbor,
        neighborKey,
        cache
      );
      if (neighborsLongestPath.length + 1 > longestPath.length)
        longestPath = { neighbor, length: neighborsLongestPath.length + 1 };
    }

    cache.set(node.id, longestPath);
    return longestPath;
  }

  private getFlattenedPath(
    node: Node,
    direction: "forward" | "backward"
  ): Node["id"][] {
    const path: Node["id"][] = [];

    const longestPaths = this.longestPaths[direction];

    let neighbor = longestPaths.get(node.id)?.neighbor;
    while (neighbor) {
      path.push(neighbor.id);
      neighbor = longestPaths.get(neighbor.id)?.neighbor;
    }

    return path;
  }

  crawl() {
    this.nodes.forEach((n) =>
      this.getLongestPathNeighbor(n, "next", this.longestPaths.forward)
    );

    this.nodes.forEach((n) =>
      this.getLongestPathNeighbor(n, "back", this.longestPaths.backward)
    );
  }

  getLongestPaths() {
    const seen = new Set<string>();
    const paths: Node[][] = [];
    for (const node of this.nodes) {
      const forwardPath = this.getFlattenedPath(node, "forward");
      const backwardPath = this.getFlattenedPath(node, "backward").reverse();

      const path = backwardPath.concat([node.id]).concat(forwardPath);

      const key = path.join();
      if (!seen.has(key)) {
        seen.add(key);
        paths.push(path.map((nodeId) => this.nodesById[nodeId]!));
      }
    }
    return paths.sort((a, b) => b.length - a.length);
  }
}

const mappedValues = computed(() => {
  type Column = {
    bottomEnd: Date;
    tiles: Tile[];
  };

  type Tile = {
    id: string;
    event: CalendarEvent<T>;
    offset: number;
    width: number;
    next: Set<Tile>;
    back: Set<Tile>;
    columnIdx: number;
    start: number;
    end: number;
  };

  const minutesInDay = 1440;
  const slotsInDay = Math.floor(minutesInDay / props.slotDuration);

  const getSlot = (time: Date) => {
    return (
      Math.floor((t.getMinutesPassedInDay(time) / minutesInDay) * slotsInDay) +
      1
    );
  };

  const columns: Column[] = [];
  const tiles: Tile[] = props.events.map((event) => ({
    id: event.id,
    event,
    next: new Set(),
    back: new Set(),
    offset: -1,
    width: -1,
    columnIdx: 0,
    start: getSlot(event.startsAt),
    end: getSlot(event.endsAt),
  }));

  // Find the column in which this event can be placed
  // building forward and backward links on the way
  tiles.forEach((tile) => {
    const event = tile.event;
    let colIdx = 0;

    while (columns[colIdx] && columns[colIdx].bottomEnd > event.startsAt) {
      colIdx++;
    }
    if (!columns[colIdx]) {
      columns[colIdx] = { bottomEnd: event.endsAt, tiles: [tile] };
    } else {
      columns[colIdx].tiles.push(tile);
      columns[colIdx].bottomEnd = event.endsAt;
    }

    tile.columnIdx = colIdx;

    // Get last attached tile
    const lastCollidingTile = columns[colIdx - 1]?.tiles.at(-1);
    if (lastCollidingTile) {
      lastCollidingTile.next.add(tile);
      tile.back.add(lastCollidingTile);
    }

    // Get next blocking tile
    let blockingColIdx = colIdx + 1;
    while (columns[blockingColIdx]) {
      if (+columns[blockingColIdx].bottomEnd > +tile.event.startsAt) {
        const blockingTile = columns[blockingColIdx].tiles.at(-1)!;
        tile.next.add(blockingTile);
        blockingTile.back.add(tile);
        if (lastCollidingTile) {
          lastCollidingTile.next.delete(blockingTile);
          blockingTile.back.delete(lastCollidingTile);
        }
        break;
      }
      blockingColIdx++;
    }
  });

  function calculateBlockingDx(path: Tile[], tileIdx: number, offset: number) {
    for (let i = tileIdx + 1; i < path.length; ++i) {
      if (path[i].offset !== -1) {
        console.log("blocking");
        return (path[i].offset - offset) / (i - tileIdx);
      }
    }
  }
  function calculateNonBlockingDx(path: Tile[]) {
    let unsetTiles = 0,
      occupiedWidth = 0;

    for (let i = 0; i < path.length; ++i) {
      if (path[i].width !== -1) {
        occupiedWidth += path[i].width;
      } else {
        ++unsetTiles;
      }
    }

    return (1 - occupiedWidth) / (unsetTiles || 1);
  }

  const pathFinder = new PathFinder(tiles);
  pathFinder.crawl();

  const paths = pathFinder.getLongestPaths();

  paths.forEach((path) => {
    path.forEach((tile, i) => {
      if (tile.width === -1) {
        const lastTile = path[i - 1];

        const offset = lastTile ? lastTile.width + lastTile.offset : 0;
        tile.offset = offset;
        tile.width =
          calculateBlockingDx(path, i, offset) ?? calculateNonBlockingDx(path);
      }
    });
  });

  return tiles;
});

watch(mappedValues, () => {});
</script>

<style scoped lang="scss">
$slot-size: 36px;

.timeline-slots {
  display: grid;
  grid-row-start: 1;
  grid-column: 1 / -1;
}

.timeline-slot {
  height: $slot-size;
  width: 100%;
}

.timeline-overlay-layer {
  height: 100%;
  grid-row-start: 1;
  grid-column-start: 2;
  position: relative;

  #current-time-marker {
    // --marker-color: #ff1d02;
    --marker-color: #838383;

    height: 2px;
    width: 100%;
    background-color: var(--marker-color);
    transform: translateX(-5px);
    position: absolute;

    &::before {
      content: "";
      position: absolute;
      left: 0px;
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
}

.hour-indicator {
  height: 0px;
  background-color: azure;
  display: flex;
  align-items: center;
  position: relative;
  // gap: 8px;

  &__label {
    font-size: 14px;
    width: 48px;
    flex-shrink: 0;
  }

  &__separator {
    width: 100%;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.day-layout {
  display: grid;
  grid-template-columns: 60px 1fr;
  max-height: 600px;
}

.timeline-events {
  overflow: scroll;
  width: 100%;
  z-index: 1;
  height: 100%;
  grid-row-start: 1;
  grid-column-start: 2;
  display: flex;
  border-left: 1px solid rgba(0, 0, 0, 0.2);
}

.day-column {
  padding-right: 40px;
  flex-basis: 0;
  flex-grow: 1;

  &:not(:first-child) {
    border-left: 1px solid rgba(0, 0, 0, 0.2);
  }

  &:last-child {
    border-right: 1px solid rgba(0, 0, 0, 0.2);
  }

  display: grid;

  .events-layer {
    grid-column-start: 1;
    grid-row-start: 1;
    grid-template-rows: repeat(48, 36px);
    display: grid;
  }
}

.event-tile {
  grid-column-start: 1;
  grid-column-start: 1;
}
</style>
