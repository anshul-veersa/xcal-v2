<template></template>

<script setup lang="ts" generic="T">
import type { CalendarEvent } from "@/types";

type Column = {
  bottomEnd: Date;
  tiles: Tile[];
};

type Tile = {
  event: CalendarEvent<T>;
  maxWidthRatio: number;
  startCol: number;
  endCol: number;
  pathId: number[];
  next: Tile[];
};

const columns: Column[] = [];
const tiles: Tile[] = [];

// [TODO]: Use CSS Grid for top to bottom placement
// and absolute positioning and % width for left to right

// Assuming events are sorted by start time and then end time in reverse
// Such that longer earlier starting events will always come earlier in line

tiles.forEach((tile) => {
  // Find the column in which this event can be placed
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

  // Get path id of last column tile
  const lastCollidingTile = columns[colIdx - 1]?.tiles.at(-1);
  if (lastCollidingTile) {
    tile.next.push(tile);
  }

  // This tile is placed in colIdx,
  // therefore all tiles before it (last tiles of each column)
  // will have their widths reduced to 1/(colIdx+1)

  const maxWidthRatio = 1 / (colIdx + 1);
  for (let c = 0; c < colIdx; c++)
    columns[c].tiles.at(-1)!.maxWidthRatio = maxWidthRatio;
});
</script>
