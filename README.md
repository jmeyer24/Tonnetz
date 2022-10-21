# Tonnetz

This project's goal is an **interactive "Tonnetz"**.

The main goal is to implement an interactive version of the ["Eulersche Tonnetz"](https://en.wikipedia.org/wiki/Tonnetz).

Maybe this project can establish an useful interpretation of the ["Vogelsche Tonnetz"](https://en.wikipedia.org/wiki/Vogel%27s_Tonnetz) as well.  
But this is only of secondary interest and will be approached after the main goal is sufficiently established.

## Features

- show scales and chords
- play scales and chords
- show chord progressions
- coloring options
- scaling and size options

## TODO

- [x] main tonnetz plane
- [x] colors for black and white keys on piano
- [x] colors for major and minor triads
- [x] center tonnetz around a single selected note (e.g. root)
	- [x] via slider
	- [ ] via click on note
		- click on note
		- get its nodeIndices value! (how?)
		- this is the new offset of the tonnetz
- [ ] highlight area of parallelogram (3 notes up, 4 notes down, both to the right, e.g. c -> ab/g# and c -> a)
- [ ] maj7 and such substituted by the jazz symbols
- [ ] notes as buttons for highlighting of chords/scales/...
- [ ] hover effect for notes (and triads?)
- [ ] find good placement and visualization of enharmonics
- [ ] gui to choose between scales and chord highlighting
	- [ ] **triads** (major/minor/augmented/diminished)
	- [ ] **seventh chords** (major/minor/...)
	- [ ] **pentatonic scales**
	- [ ] **gregorian modes** (and extensions/alterations thereof)
- [ ] one note highlighting
	- [ ] choose one note
	- [ ] highlight this note
	- [ ] adapt enharmonic notes (?)
	- [ ] and open circular option panel with which to choose function thereof like root or third note (?)
	- [ ] show function (IV, V, vi, ...) of relative **diatonic triads**
	- [ ] highlight tritonus extra (?)
	- [ ] highlight all possible chords/scales, this note is part of (again filtered by gui options), **this has some nice tree structure!**
	- [ ] choose diatonic or non-diatonic for last feature
	- [ ] scroll through these via mouse wheel (?)
- [ ] one triad highlighting
	- [ ] similar to above but highlight 3 notes from selected triad
	- [ ] as options again where this triad does appear in chords with other roots
- [ ] generate simple chord progressions
	- versions:
		- [ ] choose one start chord and one final chord (triangle buttons?!)
		- [ ] choose bassline
		- [ ] choose mode
		- [ ] choose whether passing notes are acceptable
		- [ ] work with possibilities and underlying [progression flow chart](https://www.miltonline.com/2018/10/24/tonal-harmony-flowcharts-major-minor/)
	- output:
		- [ ] print progression
		- [ ] play progression
		- [ ] highlight progression (e.g. only bassline notes or major/minor triads with numbers as order)
- [ ] maybe: add sound of this tone/chord when clicked (extra play button in gui)
- [ ] to all those options add coloring like #11/b13 as well (?)
