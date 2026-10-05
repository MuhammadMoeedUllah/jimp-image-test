# 42'-0" x 36'-0" ground floor plan (generated + verified in code)

```
npm run floorplan   # validate, render output/floor-plan-42x36.png + output/parts/*
npm test            # validation only
```

The drawing is produced by code so every dimension is exact. Nothing is drawn
until `validate.js` proves the plan works, and `render.js` then refuses any
label that overlaps another label or sits on walls, furniture or door swings.

## Modules

| file | role |
|---|---|
| `geometry.js` | single source of truth: every wall/room derived from dimension chains (plot -> wall-to-wall -> clear) |
| `furniture.js` | furniture, fixtures and the car at real sizes + the points a person must reach |
| `validate.js` | chain sums, ½" tiling proof, door/window checks, furniture fit, door swings, walking paths |
| `modules/shops.js` | module 1: commercial band (4 shops) |
| `modules/residence.js` | module 2: the house (rooms, furniture, doors, windows, tags) |
| `modules/dimensions.js` | module 3: dimension strings, generated from the same chains |
| `modules/titleblock.js` | module 4: schedules, legend, scale, notes, printed proof |
| `render.js` | stitches the modules into one sheet and runs the label audit |

## What `validate.js` checks

1. Each of the 11 dimension chains sums exactly to 42'-0", 36'-0", 15'-7" or 26'-5".
2. Rooms + walls + openings tile the plot at ½" resolution: no overlap, no gap.
3. Each door/window lies inside its wall and joins the stated spaces; door leaves swing through floor, not walls.
4. Locked: 4 shops x 8'-3" clear frontage x 13'-4" clear depth; stair 18 risers x 7", 17 treads x 9½".
5. Each of the 28 furniture items lies inside its room, overlaps nothing, stays out of door swings and approaches, and no tall item blocks a window.
6. Walking paths: every room, bed side, wardrobe, fridge, hob, sink, WC and the stair foot can be reached from the gate by a 22" wide body.

## Rev B design decisions

* **Drawing room added** behind the car porch: guest door D2 from the porch, serving door D3 from the lounge, attached guest bath. Guests never pass through the lounge.
* **Bedroom 2 moves to the first floor.** The clear ground floor is 25'-8" x 34'-6" = 885.5 sq ft. Rev B uses 843.9 sq ft of rooms (porch 186, lounge 193, drawing 116, master 133, kitchen 78, stair 44, two baths 76, shaft 18) and 41.6 sq ft of 4½" partitions, so nothing is left over. Even a minimal 10' x 10' second bedroom needs about 100 sq ft more, which would mean dropping the drawing room (Rev A) or cutting the lounge to an unusable size.
* **Kitchen** keeps a road window (W1) over the sink and a porch window (W2). The hob sits in the road-wall corner and the fridge in the far corner.
* **Car gate is a rolling shutter.** A 15'-2" car in the 16'-6" porch leaves 1'-4", so a swing gate could not open inwards and a sliding gate has nowhere to park its leaf.
* **Shop band kept at the original 15'-7"** (9" step + 9" piers + 13'-4" shop + 9" rear wall). If no front setback is required, that 9" can be given to the house.
* **North direction was not given.** Confirm it before finalising window sizes.

Rev A (two bedrooms, no drawing room) is in git history at commit `87a9b9e`.
