# House on a 26'-1" x 36'-0" plot (front = 26'-1" on the road)

```
npm run house26      # validate all floors and render output/house-26x36.png
node floorplan26/check.js ground first roof    # validation only
```

"26.1" is read as 26'-1" (313"). The brief put comfort, privacy, utility and
beauty first; no regulatory limits are applied (the whole plot is used).

## Design in one paragraph

You come in through a small pedestrian door beside the car shutter and step
onto an entry landing. On your left a 2'-0" side alley, behind a low jaali
wall, runs along the porch to the main door, so nobody squeezes past the
parked car. The car porch is ahead and to the right. The main door opens
into a foyer with a shoe cabinet and a jaali screen, so the lounge is never
on view from the door. The front room is a ground-floor bedroom suite with
its own bath, for elders or guests who should not climb stairs. Its bed
head sits on the alley wall under a high window, with a second window to
the street for cross-ventilation. Guests are received in the lounge; the
separate drawing room was given up to make room for this bedroom. The foyer
runs straight to the kitchen, so groceries never cross the lounge, and the
stair rises beside it under a skylight. An open-to-sky court in the middle
of the house gives daylight, air and a garden view to the lounge, kitchen,
family bath, master bedroom, master bath and study. Every bathroom has a
window to the street or the court. Upstairs, three bedrooms each have their
own bath; the master sits in the quiet middle with a walk-in dressing. The
roof holds the laundry beside a private drying yard, a family terrace,
eight solar panels and the water tank on the mumty.

## Floors

| | ground floor | first floor | roof |
|---|---|---|---|
| front | entry landing; side alley 2'-0" x 16'-6" behind a low jaali; car porch 10'-0" x 16'-6" (7'-6½" rolling shutter + 2'-3" pedestrian door); bedroom 11'-5½" x 15'-2½" (L-shaped) with its own bath 4'-6" x 5'-6" | bedroom 2 11'-5½" x 12'-9" + bath; bedroom 3 12'-4½" x 12'-9" + bath | 8 solar panels, front terrace |
| middle | lounge + dining 14'-1" x 10'-5" (L-shaped); foyer; stair | master 13'-8½" x 9'-10½" + walk-in dressing; hall; stair | family terrace with daybed; mumty + linen store |
| rear | family bath; court garden 7'-7½" x 7'-9"; kitchen 10'-6" x 7'-2½" | master bath; court (open); study / prayer | court grille; laundry + drying yard |

## What `check.js` proves for every floor

1. Every dimension chain adds up to exactly 26'-1" or 36'-0".
2. Rooms, walls and openings tile the plot at ½" resolution: no gaps, no overlaps.
3. Every door and window sits inside its wall and joins the right rooms; door leaves swing over floor.
4. Furniture is at real size, sits inside its room, overlaps nothing and keeps door swings and approaches clear. No tall item stands within 3 ft in front of a window.
5. A 22" wide person can reach every use point from the entry landing: the alley, the main door, the car's driver door, bed sides, wardrobes, hob, sink, fridge, WCs, desks and the washer.

The render then audits every label (364): none may touch walls, furniture,
door swings or other text.

These checks caught real problems while the plan was being designed. Some examples:
- The parked car blocked the main door.
- A shoe cabinet cut the foyer off from the lounge.
- The master bed left a 21" gap on the way to the dressing area.
- After the side alley went in, the front of the lounge could not be reached, so the TV, sofa and dining were rearranged.
- The ground-floor bed's foot was against the bath wall. The bedroom was deepened so both sides of the bed have 23".
- A wardrobe stood 11" behind part of the bedroom 2 window. It now sits 3 ft back.

## Research used (sources)

- Narrow-plot daylight and ventilation: a central court or light well, front and rear openings for cross-breeze ([studiomatrx narrow plot strategies](https://www.studiomatrx.org/guides/narrow-plot-design-strategies-india)).
- Privacy in Muslim homes: a screened entry and no direct view from the door into family spaces (the guest room these sources also recommend was traded for the ground-floor bedroom) ([McGill MCHG](https://mcgill.ca/mchg/node/41), [HRMARS review](https://hrmars.com/papers_submitted/18435/principle-of-privacy-in-islamic-architectural-design-context-a-systematic-literature-review.pdf)).
- Jaali screens for street privacy, light and air ([JK Cement jali guide](https://www.jkcement.com/blog/home-design/cement-jali-design/)).
- Stair comfort: risers of 7" to 7½", treads of 10" to 11", flights at least 36" wide, 36" landings ([JLC stair field guide](https://www.jlconline.com/how-to/interiors/stairs/stairs-field-guide/)).
- Bathroom clearances: 21" in front of the WC, 15" from its centreline, a 36" x 36" shower ([Bathroom Mountain size guide](https://www.bathroommountain.co.uk/inspiration-and-advice/bathroom-size/)).
- Pakistani room sizes and program for 5-marla houses ([Graana](https://www.graana.com/blog/5-marla-house-designs-in-pakistan/)).
- Car sizes: Corolla 4,620 x 1,775 mm, City 4,451 x 1,694 mm ([Gari.pk](https://www.gari.pk/new-cars/compare/toyota_corolla-vs-honda_city/)).
- Lahore climate: shade the south and west, use courtyards, stack ventilation and roof insulation ([UET Taxila](https://tj.uettaxila.edu.pk/index.php/technical-journal/article/view/1059)).

The LDA 2019 small-plot rules were also checked: 5 ft building line, no rear or side space under 5 marla, 80 % coverage. They are not applied here, as the brief asked.
