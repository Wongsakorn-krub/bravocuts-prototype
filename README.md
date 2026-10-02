# BRAVOCUTS — black and amber-gold prototype, edition 04

Run `npm start` (or `node server.mjs`), then open http://127.0.0.1:4173. No installation or build step is required. Run `npm test` for the availability checks.

## Current experience

`index.html` is the homepage. `booking.html` is a separate full-page booking experience. Both load `experience.js`, `experience.css`, the black/yellow theme in `midnight.css`, `model.js`, `store.js` and the language helper in `i18n.js`. Earlier UI files are retained for reference and are not loaded.

The homepage presents oversized, transparent barber portraits without frames, with a blur-and-fade transition when switching people. The booking CTA navigates to `booking.html?barber=yu` (or jeng/min), preserving the selected barber. The booking page contains barber → inline month calendar and time → hairstyle, reference photos and notes → contact details and simulated payment. There are no modal dialogs. Swipe, arrow buttons and keyboard arrows are supported; reduced motion skips the transition. Portraits are edited photographs, not 3D models.

Thai, English, Chinese and Russian booking controls are included. Brand headlines and haircut names remain in English. Reviews retain their original language. Translation requires native-speaker review before launch.

The Studio desk at `/booking.html#desk` shows the three barbers and their daily appointments. Editors are inline. Staff can create or change appointments, block breaks, change statuses, and configure working hours for a date or recurring weekday. Date-specific overrides take priority. Days off appear in the first barber selection and calendar. Conflicting schedule changes require the existing appointments/blocks to be moved or cancelled first.

## Demo data and limits

Yu, Jeng and Min are user-confirmed names. Their photos are user-supplied. Specialties, service prices, durations, seeded appointments and work hours are illustrative. A haircut lasts 45 minutes and costs a sample ฿350. PromptPay and card options simulate payment only: no money is collected, no card details are requested, and no payment gateway is connected.

Bookings, reference photos (up to two, 1 MB each) and work schedules persist in this browser's local storage. This is a local demonstration, not a live booking system. No authentication, customer account, server database or notifications are connected. Production needs authenticated staff access, transactional server-side booking and payment verification, and managed photo storage. No public deployment has been performed.

Availability uses Thailand time, configured shifts, complete service duration, 15-minute start increments, occupied time and blocked breaks. Booking supports the next 90 days. Working intervals in the prototype use start/end times within the same day.

## Sources inspected 2 October 2026

User supplied original barber photos in assets/barber-{yu,jeng,min}.webp.

Public Instagram profile: https://www.instagram.com/bravocuts_phuket/

Four local reel-cover images were downloaded from the public profile for the user-authorized prototype. Each gallery item links to its source:
- assets/work-1.jpg — https://www.instagram.com/bravocuts_phuket/reel/Ddak93HTjBb/
- assets/work-2.jpg — https://www.instagram.com/bravocuts_phuket/reel/DdVZhbGzBeW/
- assets/work-3.jpg — https://www.instagram.com/bravocuts_phuket/reel/DdOvoDFzMS6/
- assets/work-4.jpg — https://www.instagram.com/bravocuts_phuket/reel/DdF78I8ThQe/

Facebook page: https://www.facebook.com/people/Bravo-Cuts/61572961397008/
The public page lists 065 449 3994, matching Instagram's +66 654493994. The prototype uses this contact, superseding the different number seen previously on Maps. Opening hours and final contact information still require owner confirmation before launch.

Two recommendations were read directly on the public Facebook reviews page, not fabricated. No star rating is claimed:
- Pornpichai Dx, 24 March 2025: https://www.facebook.com/pornpichai.dx/posts/pfbid022RkdaLzSHbgPaci5sFgnZqv4efT37a3213DX8qttcj88TNwBFTGz8yFZyTyzoJUVl
- Natasha Ngamriab, 18 March 2025: https://www.facebook.com/fernfern.nustacha/posts/pfbid037Y3F6CKwMq3HGPAi9LaZoh179i78tN4zKvoi27znwd9R7UuDcM1otGyB1wwDcycpl

Do not modify the project's synced sources/ directory.


## Edition 03 visual references and portrait assets

The requested visual references were inspected on 2 October 2026:
- https://www.meermohsin.me/ — large frameless portrait and oversized background typography.
- https://landonorris.com/ — oversized portrait and vivid accent treatment.

BRAVOCUTS uses an independent black/yellow design; no third-party site imagery or code was copied.

The built-in ImageGen tool was used once per user-supplied barber photograph, with transparent background enabled. The results were inspected and have a genuine RGBA alpha channel. They are AI-assisted cutouts for this prototype; the original photographs remain unchanged.

Final files, relative to this project folder:
- `assets/portrait-yu.png`
- `assets/portrait-jeng.png`
- `assets/portrait-min.png`

All three are saved in:
`C:/Users/Cartoon/.codex/.chatgpt-projects/g-p-6abf6353ace88191ae6985a13dffb97d/bravocuts-prototype/assets/`

Exact prompt used for each image, with the corresponding original as the single reference:

> Use case: background-extraction. Website portrait asset. Remove ONLY the barbershop background from this supplied photograph and output a clean genuinely transparent cutout of this exact man. Crop to a tightly framed portrait from just above the entire hair to mid chest, including both shoulders. Preserve the person's real face, identity, expression, hair, skin texture, clothing and pose exactly as in the source. Do not beautify, restyle, redraw, change facial proportions or add accessories. Photographic, not illustrated. Center the head; full hair visible, shoulders reaching toward the lower edges, minimal empty space above. No frame, no border, no shadow, no new background, no text. This will be placed very large on a black website.

Validation: homepage and separate booking navigation, selected barber handoff, completed demo booking, cancellation in staff desk, all 10 availability tests, mobile widths 320/390 and desktop 1440. Browser checks found no horizontal overflow at tested mobile sizes and no application console errors on the new booking page.


## Edition 04 — shop-led homepage

The homepage now presents the storefront, interior atmosphere and shop work. Barber portraits and selection remain on booking.html. Accent colors use warm amber/gold (#efae42) against warm black instead of yellow-green. The homepage uses shop-home.js and shop-home.css in addition to the shared files.

The portfolio loops six distinct photographs continuously, with two equal-width groups for a seamless wrap. The repeated group is inert and hidden from assistive technology. Motion pauses on hover/focus and with the pause/resume button. Reduced-motion preference replaces autoplay with a manually scrollable strip.

New assets were copied without modifying the user's originals:
- assets/shop-front.png — user-supplied 770c4003-319c-4181-b091-46ef9c643e2d.png
- assets/shop-interior.jpg — user-supplied 580533278_122157263582765379_1008958472297379824_n.jpg
- assets/work-curl-fade.jpg — user-supplied 509349063_17866488168404956_6343900862841531804_n.jpg

No new generated imagery was needed for this revision. The provided storefront cutout was used directly. The six-image loop combines four previously sourced Instagram images with the supplied haircut and working-interior photographs.

## Edition 05 — one booking step at a time

Booking now shows exactly one panel: barber, calendar/time, hairstyle/references, then contact/demo payment. Next and back actions use a short directional fade/slide, disabled for reduced-motion preferences. Inactive panels are hidden and inert. The progress bar and browser history follow the active step; incomplete steps cannot be skipped. Data stays in memory when going back or changing language (reloading still starts a new draft).

Booking-only styling in booking-wizard.css simplifies borders, spacing, headings and amber accents. The approved homepage is unchanged. Availability is checked again before later steps and at confirmation. A newly unavailable slot returns the customer to the calendar with their other details retained. A barber who is off on the previewed date can still be selected to explore future dates.

Validation: 10 availability tests passed. Browser walkthrough completed all four steps, verified backward navigation and browser Back, retained name/phone/style/note across language changes, and confirmed the demo appointment appeared in the staff desk. The QA appointment was then cancelled. Thai, English, Chinese and Russian were checked; 390 px mobile and 1024 px tablet layouts had no horizontal overflow. No application console errors were reported. Payment remains simulated.

## Edition 06 — typography and black/gold styling

Shared design-system.css now defines the final visual layer for both pages: black #080808, warm gold #d1ad60, neutral dark surfaces and brighter supporting text. Main copy is 16–18 px, actions 16–17 px, supporting labels 12–14 px and section headings 30–42 px. Booking columns use more width; page and section spacing is tighter. The homepage and staff desk share the same type and color rules.

Validation: desktop visual review of home, barber, calendar, style and contact panels; mobile DOM checks confirmed 16 px form inputs, 18 px style titles, no overflowing cards or horizontal page overflow at a 390 px viewport. Booking navigation through all four panels still works, with no browser application errors. Mobile screenshot capture was unavailable in this pass; mobile layout checks used rendered element dimensions.

## Edition 07 — framed booking surfaces and photo hairstyle choices

Desktop barber selection uses a 45% portrait / 55% detail layout. The charcoal details card contains specialties and availability; the booking button and barber-switch controls are siblings outside the card. Mobile stacks the portrait and details. Calendar, time slots, reference upload, notes, contact fields and payment summary now have separate raised charcoal surfaces.

The four selectable photo cards use existing real shop assets: Curly Fade (work-curl-fade.jpg), Textured Crop (work-3.jpg), Classic Quiff (work-2.jpg), and Layered Flow (work-4.jpg). These are illustrative names and selection, not verified popularity rankings. The page explicitly says the studio must confirm its favourites.

Interaction reference: [Shiny Button by Ali Imam on 21st.dev](https://21st.dev/@designali-in/components/shiny-button), inspected alongside its button and card categories. booking-effects.js and booking-cards.css are original vanilla implementations of subtle shimmer, hover lift, pointer glow, press ripple, photo zoom and selection feedback, with reduced-motion support. No third-party component source or package was imported.

Validation: desktop screenshots of all four steps and mobile hairstyle screenshot; all four images loaded, all four options were selectable, and the selected style persisted on back navigation and appeared in the payment summary. Desktop portrait width measured 45%; the primary booking button is outside the detail card. No horizontal overflow at the tested desktop and 390 px mobile sizes, and no application console errors.
