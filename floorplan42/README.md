# Shop-house: ground floor 26'-1" x 36'-0", upper floors 42'-0" x 36'-0"

```
npm run shophouse                                  # validate all floors and render output/shophouse-42x36.png
node floorplan42/check.js ground first second      # validation only
```

The plot is the 42' x 36' corner plot from the first brief: shops on the
15'-11" band along the 36-ft road on the left, the house on the remaining
26'-1" with its gate on the front road. Every upper floor spans the whole
42' x 36', so it has two street sides (front road and shop road); the right
side and the rear are party walls.

## Ground floor: the reference plan, adjusted

The reference is 25' x 54'. Ours is 26'-1" x 36'-0", so 18 ft of depth had
to go. The reference has five bands of depth (porch 13', stair 7'-6",
kitchen / lounge 9'-12', bedrooms 13', baths + O.T.S. 5'); behind a 13'
porch and a 9'-8" stair a 36' plot has one 10'-4½" band left, not three.
So the second rear bedroom went (the client's choice: it is bedroom 3 upstairs); every other room keeps its reference place and nothing is added:

| reference (25' x 54') | here (26'-1" x 36'-0") |
|---|---|
| car porch 12'-9" x 13', gate 9' x 7', small door beside it | car porch 12'-9" x 13'-0", gate 9'-0" x 7', 2'-6" small door |
| strip between the boundary wall and the drawing room, beside the small door, sunshade over it | front alley 11'-10" x 2'-0", open to the small-door landing; the first floor projects over it |
| drawing room 10' x 12'-6", door from the porch, window on the front strip | drawing room 11'-1" x 10'-3" (the extra 1'-1" of width), same door, window on the alley |
| staircase 7' wide behind the porch | 7'-0" x 10'-0" dog-leg stair behind the porch, open to the lounge at its foot |
| double door from the porch into the lounge beside the stair | 4'-0" double door in the same place |
| bath 6'-4" x 4' + open 4' x 4'-6" behind the drawing room | guest bath 3'-11½" x 5' + open 2'-8" x 5' behind the drawing room; the bath, the drawing room and the dining all have a window on the open |
| lounge 16'-1½" x 12' with a sofa set | lounge 17'-2½" x 10'-0" (L-shaped) with the sofa set and centre table |
| kitchen 7' x 9' at the rear left behind the stair | kitchen 10'-1" x 10'-4½" (L-shaped) at the rear left behind the stair, entered from the lounge's rear corner, window on an O.T.S. |
| bedroom 11'-6" x 13' with bath 6'-9" x 5', O.T.S. | bedroom 9'-9" x 10'-4½" with a 4'-0" x 6'-4½" bath; both on a 4'-0" x 3'-7½" O.T.S. |
| second bedroom 11'-6" x 13' with bath | moves to the first floor (bedroom 3) |

Note: the reference porch is 13' deep; a 15' sedan only fits with its tail
under the gate. A 12'-6" hatchback is drawn.

## First floor: the family

TV lounge 16'-6" x 13'-9" over the porch, where the stair arrives; corner
bedroom 2 (11'-9½" x 13', L-shaped round its bath) and bedroom 3 (11'-9½" x
10') on the shop road; master bedroom 11'-1" x 13' over the drawing room
with a 5'-6" x 10' bath and a 5'-7" x 10' walk-in dressing behind it and a
private terrace over the kitchen; pantry beside the stair; study / prayer
room 11'-0" x 10'-4½" lit by both light wells; bath 3, laundry and an
L-shaped family terrace behind a jaali parapet at the rear left.

## Second floor: an independent portion

The stair lands in a 7'-4½" x 3'-3½" lobby with the portion's own front
door, so the family floor keeps its privacy. Inside: lounge + banquette
dining 16'-6" x 10'-1", a corner kitchen 11'-9½" x 10' with windows on the
shop road, bedroom A and bedroom B with baths and a dressing stacked exactly
on the suites below, a guest WC and store by the stair, a family room on the
light wells, laundry, and two open terraces.

## What `check.js` proves for every floor

1. Every dimension chain adds up to exactly 26'-1" / 42'-0" or 36'-0".
2. Rooms, walls and openings tile the plot at ½" resolution: no gaps, no overlaps.
3. Every door and window sits inside its wall and joins the right rooms; door leaves swing over floor.
4. Furniture is at real size, sits inside its room, overlaps nothing and keeps door swings and approaches clear. No tall item stands within 3 ft in front of a window.
5. A 22" wide person can reach every use point from the entry (the small door on the ground floor, the stair arrival upstairs).

The render then audits every label (625): none may touch walls, furniture, door swings or other text.

Problems the checks caught while this set was being drawn:
- The ground-floor coffee table, sofa and TV left 6" and 10" gaps that sealed off the bedroom door and the bath.
- The drawing-room centre table left 14" between the sofas.
- The first bedroom bath (4'-3") had 21" beside the shower; it is now 4'-6".
- A terrace door was 2½" wider than the terrace strip it opened onto.
- Bedroom 3's wardrobe left 13" at the bed foot on the way to its bath.
- A corridor wall stopped 52" short of the rear wall, leaving a gap.
