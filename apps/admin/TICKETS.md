# 🐛 gif4vous — Open Tickets

Eight bugs are planted in this app (plus one that requires a backend change).
Work them **in order** — later tickets are unreachable until earlier ones are
fixed, exactly like real debugging. Symptoms only; finding the cause is the job.

Rules of engagement:
1. Read the ENTIRE error — browser console, network tab, and API terminal.
   The answer is usually literally written in one of them.
2. `console.log` the data at each hop: what did the server send? what did
   `res.json()` produce? what went into state? Find the hop where reality
   diverges from expectation — the bug lives there.
3. Compare against `components/HealthBadge.tsx` — it's the certified-correct
   reference for the fetch pattern.
4. Docs before hints, hints before SOLUTIONS.md. Looking up syntax is fine
   and normal; pasting fixes you can't explain is the thing to avoid.
5. A ticket isn't closed until you can say OUT LOUD why it happened.

---

## TICKET-1 · blocker
**Every tab is broken.** All requests fail instantly. Library shows
"Error: Failed to fetch". The HealthBadge shows "API down" even though
`curl http://localhost:3000/health` works fine in a terminal.
*Expected:* the app can talk to the API at all.
*Note from QA:* the browser console has a lot to say about this one. The fix
is not in the frontend.

## TICKET-2 · blocker
**Library always says "Request failed with status 401"** even though the
token in `apps/admin/.env` is definitely correct — QA triple-checked it
matches the API's `ADMIN_TOKEN`.
*Expected:* authenticated requests succeed.
*Note from QA:* check what the app is actually SENDING (network tab →
request headers), not what you think it's sending.

## TICKET-3 · critical
**Library flashes, then the whole app goes blank.** Console shows an
uncaught TypeError mentioning `.map`.
*Expected:* the collection grid renders.
*Note from QA:* the server response looks fine in the network tab. So where
does it go wrong between the response and the render?

## TICKET-4 · critical
**The Library tab hammers the API.** Open the network tab: the same request
fires over and over, forever. The API terminal is scrolling.
*Expected:* one request when the tab opens.

## TICKET-5 · major
**Random tab shows a bizarre error** — something like
`Unexpected token 'C', "Cannot GET…" is not valid JSON`.
*Expected:* a random GIF appears.
*Note from QA:* two things are wrong in this function — the immediate cause,
and a missing guard that let the immediate cause produce such a confusing
message. Fix both; the confusing-error part is the more valuable fix.

## TICKET-6 · minor
**The "Watching for Ns" counter is stuck.** It goes 0 → 1 and never
advances, even though the interval is clearly running (add a log inside it
and see).
*Expected:* it counts up every second.
*Note from QA:* the interval fires every second. `setSeconds` is called
every second. And yet. This one is a rite of passage.

## TICKET-7 · major
**Siphon always fails with a 400**, even with a perfectly valid GIF URL.
The error mentions the fields being invalid/required — but the network tab
shows the request payload contains them, spelled correctly.
*Expected:* a valid URL siphons successfully.
*Note from QA:* the body LEAVES the browser correctly. Question is what the
server does when it ARRIVES. The API's terminal and your own backend code
(`express.json()`) are the trail.

## TICKET-8 · minor
**Removing a tag chip does nothing** — click the ×, chip stays. Weirder:
QA reports that after clicking × on "cats" and then siphoning, the saved
GIF is missing "cats" anyway, as if the removal half-worked.
*Expected:* the chip disappears when × is clicked.
*Note from QA:* "the data changed but the screen didn't" is a very specific
category of React bug. The half-worked detail is the giveaway.

---

## When all eight are closed
Victory lap: siphon three GIFs with tags via the UI, watch them appear in
Library, hit Random until you've seen all three. Full stack, all yours.
Then the real build starts: the proper admin app from the design brief,
with TanStack Query — where you'll discover half these bugs are impossible
by construction, and you'll know exactly which half and why.
