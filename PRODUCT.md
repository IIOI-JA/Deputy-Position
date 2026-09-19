# Product

## Register

brand

This surface is a **product showcase deck** — a link sent to practising psychologists to give a
persuasive first glance at Deputy. Design IS the product here: the visitor's impression is the
thing being made. It is not app UI.

## Users

**Practising psychologists**, primarily in Denmark, Germany and the wider EU. Certified EMDR
practitioners are a sub-segment.

Their context when they open this: a colleague or Jörg Albers has sent them a link. They have
maybe ninety seconds. They are professionally sceptical of anything that smells like an AI
product being sold into clinical work, and they are right to be.

The job they are trying to get done: decide, quickly, whether this is a serious clinical
instrument authored by a peer, or another chatbot wearing a lab coat.

The commercial goal behind the deck: **25 test users by end of Week 45.**

## Product Purpose

Deputy turns a psychologist's own professional method into a structured digital protocol that
extends their presence and continuity beyond the session — a psychologist-led alternative to
generic AI "shadow therapists".

The deck's single job is to make that proposition land emotionally before it is explained
mechanically, and to end on one unmistakable action: **Create your Deputy protocol.**

**Sizzle, not steak.** Sell the transformation and the stakes, not the feature list. No
implementation detail, no architecture, no AI plumbing.

### External message hierarchy (from the value-proposition document — do not reorder)

1. Customer value: continuity, consistency, extension of the psychologist's own work
2. The psychologist's **own individual protocol**
3. Deputy as the technical platform and delivery environment
4. Existing protocols (Decompression, Decluttering) as *proof*, not as the menu

Internally, Decompression and Decluttering are prized proprietary assets. That internal
importance must **not** drive the external hierarchy. The deck leads with the psychologist's own
method; the standard works appear as evidence the structure works, never as the headline.

### Slide sequence (per "Vercel Edit Instructions", 9_26 revision — current)

`Hero · Your method · 167 hours · Between sessions · The difference · What you gain ·
From method to protocol · No AI expertise · Already built · One sentence · Next step`

**Tone directive:** calmer, more clinical, more collegial. Not an anti-chatbot campaign — a
professional invitation. Fewer negations; say what Deputy *is* before what it is not. The
chatbot contrast appears at page 5 as differentiation, never as alarm, and never dominates.
Do not name competing products. "Shadow therapist" no longer appears on the page.

**Structural rules:** the offer ("Your method becomes your Deputy protocol") sits directly after
the hero. No wordmark in the hero — the value line is the h1; the brand lives in the shell.
The four-step funnel is kept, with "technology adapts to the method, not the other way round"
intact. The reassurance ("no AI expertise required") is its own quiet page, not a chip strip.

### The conversion test this page must pass

After 30 seconds a psychologist should be able to complete both sentences without help:
*"Deputy is valuable to me because…"* and *"To get my own Deputy protocol, I would now…"*
If either is unclear, the page is still describing Deputy rather than converting interest.

## Brand Personality

**Measured. Clinical. Unhurried.**

The house test, verbatim from the founder: *"blow socks gently."* If a line reads as excited,
salesy or loud, it is wrong regardless of how good it looks.

Voice rules: short declarative sentences. Name the problem plainly before naming the answer.
Address the clinician as a professional peer, never as a lead. Concrete about what changes.

Banned: exclamation marks; "revolutionary", "cutting-edge", "game-changing", "seamless";
AI-forward framing; the word "materials" for what a client receives (they receive a *process*);
any efficacy statistic, outcome number, or price; the legacy name "AI-Deputy".

## Anti-references

- **Any AI-product landing page.** Deputy is not sold as an AI solution. AI is a technical
  component and never the headline. No neural-network motifs, no chat bubbles, no sparkle icons.
- **Therapy-app consumer wellness** — soft gradients, rounded blobs, pastel illustration,
  encouraging exclamation marks. The audience is the clinician, not the client.
- **SaaS pitch-deck grammar** — the hero-metric template, logo walls, "trusted by", feature
  matrices, and invented traction numbers.
- **Editorial-magazine pastiche** — display-serif italic, drop caps, ruled broadsheet columns.
  Currently the saturated AI-brand lane; it is also the wrong register for a clinical instrument.

## Design Principles

1. **The instrument, not the intelligence.** Every slide reinforces that the psychologist is the
   author and the professional reference point. Deputy carries the method; it never makes
   clinical decisions.
2. **Name the gap before selling the fix.** The 167 unattended hours and the "shadow therapist"
   problem land first. The answer only earns attention once the stakes are real.
3. **Restraint signals seriousness.** Slow motion, the deputy.dk light canvas, one accent. On a subject
   this sensitive, spectacle would read as untrustworthy.
4. **One idea per slide, one action at the end.** The closing page carries the full ask:
   **Create your Deputy protocol** → *Book a conversation* / *Explore an existing protocol*.
   The first step stays small and concrete: bring one intervention you already use.
5. **Specificity over decoration.** Every visual is built from Deputy's own argument — the
   168-hour week, the authoring pipeline. Nothing generic, nothing stock.

## Accessibility & Inclusion

- WCAG 2.1 AA. Body text ≥4.5:1, large text ≥3:1 against the light canvas; verified, not assumed.
- `prefers-reduced-motion` fully respected — reveals resolve to their visible end state, the
  carousel stops auto-advancing, the week grid renders complete.
- Reveals animate from `opacity: .3`, never `0`, so content is legible even if a transition
  never fires (hidden tab, headless render, print).
- Full keyboard navigation: arrows / Page keys / Home / End, `L` cycles language.
- Trilingual EN / DA / DE, with `<html lang>` updated on switch so screen readers change voice.
- Colour is never the sole carrier of meaning; the accented items also differ in weight or label.
