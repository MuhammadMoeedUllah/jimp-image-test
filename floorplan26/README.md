# House on a 26'-1" x 36'-0" plot (front = 26'-1" on the road)

```
npm run house26      # validate all floors and render output/house-26x36.png
node floorplan26/check.js ground first roof    # validation only
```

"26.1" is read as 26'-1" (313"). The brief put comfort, privacy, utility and
beauty first; no regulatory limits are applied (the whole plot is used).

## Design in one paragraph

You come in through a small door beside the car shutter and stand on an
entry landing. On your left, a 2'-0" deep front alley runs along the whole
front of the house behind a jaali (perforated brick) boundary wall; the
house proper starts behind it. The car porch is straight ahead and to the
right, and the main door is at its far end, so the walk in is always under
cover. The alley is the house's buffer from the street: the ground-floor
bedroom and its bath open their windows onto it instead of the road, the AC
condensers hang in it and exhaust through the jaali, and a jasmine climbs
the screen. That bedroom is a suite for elders: a 3'-0" door, a pocket door
to a bath with a walk-in shower, and no stairs. The main door opens into a
foyer with a shoe cabinet and a jaali screen, so the lounge is never on view
from the door; the foyer runs straight to the kitchen, and the stair rises
beside it under a skylight. In the lounge a banquette seats six for dinner
and faces the TV with the sofa; the TV sits on the court wall beside a glass
slider, so the eye always ends in the garden. The open-to-sky court lights
the lounge, kitchen, family bath, master bedroom, master bath and study.
Every bathroom has a window to the alley or the court. Upstairs, three
bedrooms each have their own bath; the master sits in the quiet middle with
a walk-in dressing. The roof holds the laundry beside a private drying yard,
a family terrace, eight solar panels and the water tank on the mumty.

## Floors

| | ground floor | first floor | roof |
|---|---|---|---|
| front | front alley 14'-1" x 2'-0" behind a jaali wall; car porch 10'-6" x 16'-6" (7'-8" rolling shutter + 2'-4" small door); bedroom 13'-4" x 12'-4½" (L-shaped) with its own bath 4'-6" x 8'-0" | bedroom 2 13'-4" x 12'-9" + bath; bedroom 3 10'-6" x 12'-9" + bath | 8 solar panels, front terrace |
| middle | lounge + banquette dining 14'-1" x 10'-6" (L-shaped); foyer; stair | master 13'-8½" x 9'-10½" + walk-in dressing; hall; stair | family terrace with daybed; mumty + linen store |
| rear | family bath; court garden 7'-7½" x 7'-9"; kitchen 10'-6" x 7'-2½" | master bath; court (open); study / prayer | court grille; laundry + drying yard |

## What `check.js` proves for every floor

1. Every dimension chain adds up to exactly 26'-1" or 36'-0".
2. Rooms, walls and openings tile the plot at ½" resolution: no gaps, no overlaps.
3. Every door and window sits inside its wall and joins the right rooms; door leaves swing over floor.
4. Furniture is at real size, sits inside its room, overlaps nothing and keeps door swings and approaches clear. No tall item stands within 3 ft in front of a window.
5. A 22" wide person can reach every use point from the entry landing: both ends of the alley, the main door, the car's driver door, bed sides, wardrobes, hob, sink, fridge, WCs, desks and the washer.

The render then audits every label (364): none may touch walls, furniture,
door swings or other text.

These checks caught real problems while the plan was being designed. Some examples:
- The parked car blocked the main door.
- A shoe cabinet cut the foyer off from the lounge.
- The master bed left a 21" gap on the way to the dressing area.
- With the front alley in place, the first lounge layout (sofa on the bedroom wall, dining on the party wall) left 12" to 14" gaps that cut the bedroom door and the family bath off from the rest of the house. The lounge was re-zoned around a banquette whose chair pull-out doubles as the walkway.
- The ground-floor wardrobe had 16" in front of it; the bedroom was deepened to give it 24".
- A wardrobe stood 11" behind part of the bedroom 2 window. It now sits 3 ft back.

## Research used (sources)

- Jaali screens in Lahore: perforated screens cut cooling load and improve visual comfort; they ventilate, temper glare and give privacy ([University of Oregon study](https://scholarsbank.uoregon.edu/xmlui/handle/1794/17931), [Morphogenesis](https://www.morphogenesis.org/?p=7380), [jali brick guide](https://www.bricknbolt.com/blogs-and-articles/construction-guide/jali-brick-types-benefits)). Punjab bylaws themselves allow a 0.9 m solid wall with a perforated jali above ([PSIEC](https://psiec.punjab.gov.in/wp-content/uploads/2022/04/layoutcII32020.pdf)).
- Aging in place: 32" clear door width (a 36" door), curbless showers at least 36" wide, bracing for grab bars, outward-swinging or sliding bathroom doors ([Houston Aging in Place standards](https://311.houstontx.gov/housing/compliance/bsc/Aging_in_Place_Design_Standards.pdf), [NAHB checklist](https://nahb.org/education-and-events/credentials/certified-aging-in-place-specialist-caps/additional-caps-resources/aging-in-place-remodeling-checklist)).
- Dining clearances: 36" minimum behind a chair, 42" to 48" where people pass ([Arcedior](https://arcedior.com/blog/chair-clearance-behind-dining-tables), [Homestyler](https://www.homestyler.com/article/essential-dining-room-design)).
- TV viewing distance: 5'-3" to 7'-10" for a 43" 4K set, 6'-3" to 9'-2" for 50" ([Vebos](https://www.vebos.co.uk/blog/the-ideal-viewing-distance-for-the-television.html), [FCI London](https://www.fcilondon.co.uk/blog/How-Far-From-The-TV-Should-Your-Sofa-Be)).
- Courtyards in hot-dry climates: stack ventilation and night purging; water and plants cool the court air by 3 to 7 degrees C ([studiomatrx](https://www.studiomatrx.org/guides/courtyard-homes-india-climate-responsive), [UET Taxila on Lahore houses](https://tj.uettaxila.edu.pk/index.php/technical-journal/article/view/1059), [IIPS on Pakistani homes](https://iips.com.pk/natural-ventilation-and-passive-design-optimizing-comfort-in-pakistani-homes/)).
- Car access: 12" to 18" clearance each side of the car through the gate; a rolling door needs 3.5" to 5" at each side for its guides ([garage door sizing](https://next-cms.climatetrace.org/width-of-one-car-garage-door)).
- Jasmine: motia (Jasminum sambac) is Pakistan's national flower and a shrub for pots; chambeli is the climber for the jaali ([Wikipedia](https://en.wikipedia.org/wiki/Jasmine_in_Karnataka), [CDA Gardenia](https://gardenia.cda.gov.pk/products/passiflora)).
- Earlier round: narrow-plot daylight ([studiomatrx](https://www.studiomatrx.org/guides/narrow-plot-design-strategies-india)), privacy in Muslim homes ([McGill MCHG](https://mcgill.ca/mchg/node/41)), stair comfort ([JLC](https://www.jlconline.com/how-to/interiors/stairs/stairs-field-guide/)), bathroom clearances ([Bathroom Mountain](https://www.bathroommountain.co.uk/inspiration-and-advice/bathroom-size/)), Pakistani room sizes ([Graana](https://www.graana.com/blog/5-marla-house-designs-in-pakistan/)), car sizes ([Gari.pk](https://www.gari.pk/new-cars/compare/toyota_corolla-vs-honda_city/)).

The LDA 2019 small-plot rules were also checked: 5 ft building line, no rear or side space under 5 marla, 80 % coverage. They are not applied here, as the brief asked.
