<div align="center">

# ⚡ CivicPulse

### *Report. Track. Resolve. Hold Your City Accountable.*

**A community-driven, AI-powered civic issue platform for Pune — and every city that deserves better.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📚 Table of Contents

1. [🏘️ What Is CivicPulse?](#️-what-is-civicpulse)
2. [✨ Features At a Glance](#-features-at-a-glance)
3. [🧩 Tech Stack — Simply Explained](#-tech-stack--simply-explained)
4. [🗺️ How the Website Works](#️-how-the-website-works)
5. [🏗️ System Architecture](#️-system-architecture)
6. [🔐 Security — Now & In the Future](#-security--now--in-the-future)
7. [🚀 Quick Start for Developers](#-quick-start-for-developers)
8. [🤔 Common Questions (Even Kid-Friendly Ones!)](#-common-questions-even-kid-friendly-ones)
9. [💡 Did You Know?](#-did-you-know)
10. [📖 Glossary of Tech Terms](#-glossary-of-tech-terms)

---

## 🏘️ What Is CivicPulse?

> **Imagine your neighbourhood had a suggestion box… but it was magic.**
>
> You drop a note saying "There's a huge pothole on my street" — and instead of it disappearing forever, a computer reads it, figures out *who* should fix it, tells the right government department, tracks whether they actually do it, and lets your whole neighbourhood vote on whether the fix was real. *That's CivicPulse.*

**CivicPulse** is a web application where **ordinary citizens** can report local problems — potholes, broken streetlights, garbage piles, water leaks — and then **track those issues** from report all the way to verified resolution.

It is built for **Pune, India**, but the idea works for any city in the world.

### 👥 Who is it for?

| Role | What they do |
|------|-------------|
| 🧑‍💼 **Citizens** | Report problems, support others reports, comment, browse the map, vote on resolutions |
| 🛡️ **Locality Moderators** | Verify reports in their area, escalate serious issues, manage their case queue |
| ⚙️ **Super Admins** | Manage the entire platform — departments, moderators, analytics |

### 🌟 Why we built it

Most city complaint portals are one-way streets. You submit a complaint, and it vanishes into a black hole. **CivicPulse closes the loop**: from your report → AI classification → department routing → SLA tracking → community-verified resolution. Every step is visible to every citizen.

---

## ✨ Features At a Glance

| Feature | What it Does |
|---------|-------------|
| 📝 **Issue Feed** | Browse all reported civic problems like a social media feed |
| 🗺️ **Interactive Map** | See every problem pinned on a real map of your city |
| 🎬 **Reels View** | Scroll through issue updates TikTok-style |
| ➕ **Report a Problem** | Submit an issue with photos, location, and description |
| 💬 **Community Chat** | Talk to neighbours about local issues |
| 🔔 **Notifications** | Get alerted when your issue status changes |
| 🏆 **Leaderboard** | See the most active citizens earning impact points |
| 👤 **Profiles** | Personal profile tracking your contributions |
| ⚙️ **Control Panel** | Admin dashboard: case queue, departments, moderator management |
| 📊 **SLA Tracking** | Automated timelines ensuring departments stay accountable |
| 🤖 **AI Classification** | Auto-detects category, severity, and routes to the right department |
| 🗳️ **Community Verification** | Citizens vote to confirm if an issue is truly resolved |

---

## 🧩 Tech Stack — Simply Explained

> **Think of building a website like building a restaurant.** You need the dining room customers see (frontend), the kitchen where food is made (backend), the pantry where ingredients are stored (database), and the recipe books and suppliers (libraries and services). Here is exactly what we used and why.

---

### 🎨 Frontend (What You See)

#### ⚛️ React 19
> **"React is like LEGO blocks for websites."**

React lets us build the website out of small, reusable **components** — think of each button, card, and page as a separate LEGO piece. We can snap them together in different ways without rewriting everything from scratch. When something on the screen changes (like a new notification appearing), React updates *only that piece*, not the whole page — like swapping one LEGO block without demolishing the whole castle.

**What it does for us:** Builds every page, button, card, map, form, and interactive element.

---

#### ⚡ Vite
> **"Vite is like a super-speed oven for baking your website code."**

When we write code, it needs to be *processed* before a browser can understand it. Vite does this blazingly fast — during development your changes appear in the browser almost instantly (Hot Module Replacement). When we ship to production, it squashes all our code into tiny files so the website loads fast for users.

**What it does for us:** Builds, bundles, and serves our development environment. Also handles environment variables (secret keys stored safely).

---

#### 🎭 Framer Motion
> **"Framer Motion is the animator who makes things slide, fade, and bounce beautifully."**

Every time a page loads with a smooth fade-in, or a card pops up with a subtle animation, that is Framer Motion at work. Without it, things would just *snap* into place — with it, the interface feels alive and professional.

**What it does for us:** Page transitions, card animations, stagger effects on lists.

---

#### 🗺️ Leaflet + React-Leaflet
> **"Leaflet is like putting a real Google Maps inside our website — for free."**

Leaflet is an open-source mapping library. React-Leaflet is the wrapper that lets us use Leaflet as React components. Our **Map Page** shows every reported issue as a pin on a real interactive map of Pune. Users can zoom in, click pins to see details, and filter by issue type.

**What it does for us:** Powers the full interactive map view, issue pins, and heatmap visualization.

---

#### 📈 Recharts
> **"Recharts is the tool that turns raw numbers into pretty charts and graphs."**

The Admin Control Panel needs to show statistics — how many issues were resolved this week? Which neighbourhood has the most problems? Recharts takes those numbers and draws beautiful bar charts, pie charts, and line graphs.

**What it does for us:** All analytics charts in the Admin Control Panel dashboard.

---

#### 🎯 Lucide React
> **"Lucide is a giant box of 1,000+ perfect little icons."**

Every icon you see — the map pin, the bell, the shield, the chart bars — comes from Lucide React. These are crisp, consistent SVG icons that look great on any screen size.

**What it does for us:** Every icon throughout the entire application.

---

#### 🎨 Vanilla CSS (Custom Design System)
> **"Our CSS is like the interior designer who chose every colour, font, and spacing rule."**

We use pure CSS with **CSS custom properties** (variables) to define our entire design system — colours, font sizes, spacing, shadows, border radii. This means changing one variable updates the colour *everywhere* at once.

**Files:** `src/styles/index.css`, `src/styles/components.css`, `src/styles/localvoice.css`

**What it does for us:** All styling — dark theme, gradients, responsive layouts, animations, glassmorphism effects.

---

### ⚙️ Backend (The Kitchen)

#### 🟢 Supabase
> **"Supabase is like hiring a fully-staffed kitchen so you do not have to build one from scratch."**

Supabase is our **Backend-as-a-Service (BaaS)**. It gives us:
- A **PostgreSQL database** (where all data lives)
- **Authentication** (login / signup / phone OTP)
- **Row Level Security** (database rules ensuring users only see what they are allowed to)
- **Storage buckets** (for photo uploads)
- **Real-time subscriptions** (so your feed updates without refreshing)

Without Supabase, we would need to build our own server, write our own login system, manage our own database — months of extra work. Supabase handles all that.

**What it does for us:** Database, auth, file storage, real-time data, security policies.

---

### 🗄️ Database (The Pantry)

#### 🐘 PostgreSQL (via Supabase)
> **"PostgreSQL is like a giant, perfectly organised filing cabinet."**

Our database has these main tables:

| Table | What is stored inside |
|-------|----------------------|
| `users` | Every registered citizen — name, email, role, locality, impact score |
| `problems` | Every reported civic issue — title, description, category, GPS location, photos, status |
| `problem_support` | Who upvoted which issue (prevents double-voting) |
| `comments` | All comments on issues |
| `departments` | Government departments (Public Works, Water Supply, etc.) |
| `escalations` | When an issue is formally sent to a department |
| `status_history` | Full audit trail of every status change |
| `notifications` | Alert messages for each user |
| `localities` | Neighbourhood data (Kothrud, Aundh, Baner, etc.) |

**Row Level Security (RLS):** Database-level rules that ensure citizens can only edit their own profile, only moderators can verify problems, etc.

---

### 🛠️ Developer Tools

#### 🔍 OxLint
> **"OxLint is the spell-checker for our code."**

It reads our JavaScript/React code and flags potential bugs, bad practices, and style issues *before* we run the app.

#### 📦 npm (Node Package Manager)
> **"npm is like an app store for code libraries."**

Whenever we need a pre-built tool, we type `npm install` and it downloads and sets it up automatically.

---

### ☁️ Hosting and Cloud

The production build (`dist/` folder) is a collection of static HTML/CSS/JS files that can be deployed to:

- **Vercel** *(recommended)* — free, automatic deploys from GitHub
- **Netlify** — similar free static hosting
- **Cloudflare Pages** — global CDN edge hosting

**Supabase** itself runs on **AWS** cloud infrastructure globally, so your data is safe and accessible from anywhere.

---

## 🗺️ How the Website Works

### 🚶 Step-by-Step: A Citizen Journey

```
YOU open your browser and go to the CivicPulse website
        |
        v
(1) BROWSER loads index.html + our JavaScript bundle
        |
        v
(2) REACT boots up — checks if you are logged in
  (looks at localStorage for a saved session)
        |
        |-- Not logged in? --> Show the Landing page --> Redirect to /auth
        |
        +-- Logged in? --> Load your profile from Supabase
                |
                v
(3) YOUR FEED loads
   React asks Supabase: "Give me all recent problems"
   Supabase checks your permissions, returns the data
   React renders each problem as a card
        |
        v
(4) YOU click "Report a Problem"
   You fill in: title, category, description
   You pick your location on the map
   You upload a photo (stored in Supabase Storage — evidence bucket)
        |
        v
(5) YOU hit Submit
   React sends data to Supabase database
   A new row appears in the problems table
   AI classification detects the category + severity
   The right government department is notified
        |
        v
(6) OTHER CITIZENS see your report in their feed
   They can click "Support" to upvote it
   They can comment below
   Moderators can "Verify" the issue
        |
        v
(7) STATUS TRACKER updates in real-time
   Reported --> Verified --> Escalated --> In Progress --> Resolved
   You get a notification at each step
        |
        v
(8) RESOLUTION — Community votes to confirm the fix is real
   Issue marked Resolved
   Your impact score goes up
```

---

### 🖱️ Behind the Scenes: What Happens When You Click a Button

**When you click "Support" (upvote) on an issue:**
1. React calls `supabase.from('problem_support').insert(...)`
2. Supabase checks: is this user authenticated? Have they already supported this issue?
3. If valid: a new row is added to `problem_support`, and the `support_count` on the problem increments
4. The button on your screen immediately toggles (optimistic UI — React updates before waiting for server confirmation)

**When you open the Map page:**
1. React fetches all problems with GPS coordinates from Supabase
2. React-Leaflet renders OpenStreetMap tiles as the background
3. Each problem is plotted as a coloured circle at its latitude/longitude
4. Clicking a circle opens a popup card with the issue details

**When a Moderator updates a status:**
1. Moderator changes status in the Control Panel Case Queue
2. React writes to Supabase: update `problems` table where `id = X`
3. Supabase RLS confirms the user has moderator/admin role
4. A new row is inserted into `status_history` (audit trail)
5. A notification is created for the original reporter
6. The status stepper component updates across all views

---

## 🏗️ System Architecture

> **Think of the architecture like a city itself:**
> - Your Browser = Your house (where you live and interact)
> - Supabase = The city hall (stores all records, handles official business)
> - OpenStreetMap / Leaflet = The city map service
> - CDN / Hosting = The roads that bring the website to your front door

```
+------------------------------------------------------------------+
|                        USER'S BROWSER                            |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  |                   React Application                          | |
|  |                                                              | |
|  |  +----------+ +----------+ +----------+ +----------+        | |
|  |  |  Pages   | |Components| |  Layouts | |  Router  |        | |
|  |  | Landing  | | ProbCard | | Citizen  | |  /map    |        | |
|  |  | Feed     | | MapView  | | Control  | |  /reels  |        | |
|  |  | MapPage  | | ReelsFeed| |  Panel   | |  /report |        | |
|  |  +----------+ +----------+ +----------+ +----------+        | |
|  |                                                              | |
|  |  +--------------------------------------------------+       | |
|  |  |           State and Auth Layer                    |       | |
|  |  |  AuthContext  |  Store  |  Permissions            |       | |
|  |  +--------------------------------------------------+       | |
|  +-------------------------------------------------------------+ |
|                            |                                     |
|           Supabase JS Client (@supabase/supabase-js)            |
+----------------------------+------------------------------------- +
                             | HTTPS API Calls
                             v
+------------------------------------------------------------------+
|                      SUPABASE CLOUD (AWS)                        |
|                                                                  |
|  +-----------------+  +------------------+  +-----------------+ |
|  |  Auth Service   |  |  PostgreSQL DB   |  |  File Storage   | |
|  |                 |  |                  |  |                 | |
|  | - Email/Pass    |  | users            |  | evidence/       | |
|  | - Phone OTP     |  | problems         |  | (issue photos)  | |
|  | - JWT tokens    |  | comments         |  |                 | |
|  | - Sessions      |  | departments      |  | Public CDN URL  | |
|  |                 |  | escalations      |  |                 | |
|  +-----------------+  | notifications    |  +-----------------+ |
|                        | status_history   |                      |
|                        | localities       |                      |
|                        | Row Level Sec.   |                      |
|                        +------------------+                      |
+------------------------------------------------------------------+
                             |
                             v
+------------------------------------------------------------------+
|                     THIRD-PARTY SERVICES                         |
|                                                                  |
|  OpenStreetMap — Map tiles (the actual map background)           |
|  npm CDN — Libraries downloaded during build time                |
|  Vercel/Netlify — Hosts the built website files globally         |
+------------------------------------------------------------------+
```

### How the parts talk to each other

| Who talks | To whom | How | What they say |
|-----------|---------|-----|---------------|
| Browser | Supabase | HTTPS REST | "Give me all problems in Kothrud" |
| Browser | Supabase Auth | HTTPS | "Log in with email + password" |
| Browser | Supabase Storage | HTTPS | "Upload this photo file" |
| Browser | OpenStreetMap | HTTPS | "Send me map image tiles for Pune" |
| Supabase | Browser | JSON response | "Here are 42 problems, with their data" |

**Data flow is always:** Browser → Supabase → PostgreSQL → back to Browser. There is no separate custom server — Supabase *is* the server layer.

---

## 🔐 Security — Now & In the Future

> **Think of security like protecting a house.**
> - A lock on the door = Authentication (only people with keys can enter)
> - Different keys for different rooms = Authorization (admins can enter the control room, citizens cannot)
> - A sealed envelope = Encryption (no one can read your message while it travels)
> - A guard who checks IDs = Input validation (reject anything suspicious)
> - A burglar alarm = Rate limiting (too many failed attempts? Alarm goes off)

---

### ✅ Security Features Already In Place

#### 🔑 Authentication
- Users must **sign up and log in** to report or interact with issues
- Login uses **email + password** or **phone number OTP** (one-time passcode sent via SMS)
- Sessions are managed securely via Supabase JWT tokens

#### 🏷️ Role-Based Access Control (RBAC)
Our permissions system (`src/lib/permissions.js`) defines exactly what each role can do:

```
citizen     --> Can: report, support, comment, view
moderator   --> Can: everything above + verify, reject, escalate issues
super_admin --> Can: everything + manage departments, moderators, settings
```

If a citizen tries to visit `/control-panel`, the `ProtectedRoute` component immediately redirects them. The *database* also enforces this — even if someone tricks the UI, Supabase RLS policies block unauthorized reads/writes at the server level.

#### 🔒 Row Level Security (RLS)
Every table in PostgreSQL has database-level rules. Examples:
- "Users update own profile" — you can only edit *your own* profile row
- "Staff can create escalations" — only moderators/admins can escalate
- "Users read own notifications" — you only see *your* notifications, never someone elses

These rules run inside the database itself — they cannot be bypassed by any frontend trick.

#### 🔐 Environment Variables and Secret Keys
Sensitive credentials (Supabase URL, API keys) are stored in `.env.local` files — **never hardcoded** in source code and **never committed to GitHub** (`.gitignore` blocks them). A safe `.env.example` template is provided instead.

#### 📁 Storage Security
Photo uploads go into Supabase's `evidence` bucket. The storage policies allow:
- **Anyone** to *read* (view) evidence photos (public access)
- Only **authenticated users** to *upload* new photos

This prevents anonymous spam uploads while keeping evidence accessible.

#### 🛡️ Input Validation (Database Level)
The database schema enforces valid values using CHECK constraints:

```sql
check (category in ('pothole', 'garbage', 'water_leakage', ...))
check (status in ('reported', 'verified', 'escalated', ...))
check (role in ('citizen', 'moderator', 'super_admin'))
```

If anyone tries to insert an invalid category or role, the database rejects it outright.

---

### 🔭 Planned Security Enhancements

#### 🔒 HTTPS / SSL
Like switching from sending postcards (readable by anyone) to sealed envelopes. Vercel/Netlify automatically enable HTTPS. We will enforce HTTPS-only with HTTP Strict Transport Security (HSTS) headers.

#### 🚦 Rate Limiting
Like a bouncer who says "you have knocked too many times, wait outside." Supabase Auth includes basic rate limiting. For production, we will add Cloudflare rate limiting rules — e.g., max 10 login attempts per IP per minute.

#### 🔥 Web Application Firewall (WAF)
Like a metal detector at the entrance that blocks weapons. A WAF inspects all incoming traffic and blocks known attack patterns (SQL injection, XSS attacks) before they reach our app. **Planned:** Cloudflare WAF.

#### 🧪 Penetration Testing
Like hiring a professional to test if your house is actually secure. Ethical hackers deliberately try to break into the system to find weaknesses before real attackers do. **Planned:** Annual third-party pen tests before major releases.

#### 🔎 Security Audits
Regular code reviews focused specifically on security vulnerabilities. **Planned:** Quarterly audits using tools like `npm audit` and Snyk.

#### 🐛 Bug Bounty Program
Like offering a reward to anyone who finds a hidden trapdoor and reports it honestly. A public program where security researchers can responsibly disclose vulnerabilities. **Planned:** Launch via HackerOne after v1.0 release.

#### 📋 GDPR and Privacy Compliance
"Your data belongs to you." The General Data Protection Regulation gives users rights:
- Right to see what data we store about you
- Right to delete your account and data
- Right to export your data
- Clear privacy policy explaining what we collect and why

**Planned:** Full GDPR-compliant data deletion flow, privacy policy page, and cookie consent.

#### 🔐 Two-Factor Authentication (2FA)
For admin accounts, require a second verification step (authenticator app code) in addition to a password. **Planned:** Via Supabase Auth TOTP support.

#### 🔄 Dependency Scanning
Automatically scanning `package.json` dependencies for known security vulnerabilities using **Dependabot** and `npm audit` in the CI/CD pipeline.

---

## 🚀 Quick Start for Developers

> **Think of this as the recipe card for setting up the project on your own computer.**

### What you need first (Prerequisites)

- **Node.js** (version 18 or higher) — [Download here](https://nodejs.org/)
- **Git** — [Download here](https://git-scm.com/)
- A code editor like **VS Code** — [Download here](https://code.visualstudio.com/)

### Step 1: Get the code

```bash
git clone https://github.com/PreetTank35/CivicPluse.git
cd CivicPluse/civicpulse
```

### Step 2: Install all the tools

```bash
npm install
```

This reads `package.json` and downloads all libraries into a `node_modules/` folder.

### Step 3: Set up environment variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **No Supabase yet?** The app runs in **Demo Mode** automatically without credentials! All data will be mock/sample data. Perfect for exploring.

### Step 4: Start the development server

```bash
npm run dev
```

Open your browser and visit: **http://localhost:5173**

### Step 5: Try the different roles

The app ships with three demo accounts you can switch between from the profile page:

| Role | Email | Access Level |
|------|-------|-------------|
| 👤 Citizen | `citizen@civicpulse.app` | Issue feed, map, reels |
| 🛡️ Moderator | `moderator@civicpulse.app` | + Control Panel case queue |
| ⚙️ Admin | `admin@civicpulse.app` | + Departments and moderator management |

### Available Commands

```bash
npm run dev       # Start development server (with hot reload)
npm run build     # Build for production (creates dist/ folder)
npm run preview   # Preview the production build locally
npm run lint      # Check code for errors with OxLint
```

### Setting Up a Real Supabase Backend

1. Go to [supabase.com](https://supabase.com) and create a free account and new project
2. Go to **Settings → API** and copy your `URL` and `anon public` key
3. Paste them into `.env.local`
4. Open Supabase SQL Editor and paste the entire content of `supabase/schema.sql`
5. Click **Run** — this creates all your tables, policies, and storage buckets
6. Restart the dev server — you are now connected to a real database!

---

## 🤔 Common Questions (Even Kid-Friendly Ones!)

**Q: Why can't I just use Google Maps for the map?**

Google Maps costs money for high-usage apps. **OpenStreetMap** (used by Leaflet) is a free, open-source alternative built by volunteers — like Wikipedia but for maps!

**Q: What is a UUID and why are all the IDs so long and weird?**

A UUID looks like `9bfa903e-d48d-efc6-eb60-09e8182c511b`. They are long because they are designed so that *two different computers can each generate a new ID at the same time* and the IDs will **never** clash — no coordination needed!

**Q: Why does the website feel like an app, not a normal website?**

CivicPulse is a **Single Page Application (SPA)**. Instead of loading a completely new HTML file every time you click a link, React just swaps out the content on the same page. This makes navigation feel instant — like flipping pages in a book rather than picking up a whole new book each time.

**Q: Is my location safe? Does the app track where I am?**

Location is only used when *you choose to attach it* to a problem report — it is never tracked in the background. The GPS coordinates you provide are stored with the problem to pin it on the map. Your location is not logged at any other time.

**Q: What is SLA?**

**SLA = Service Level Agreement.** It is a promise a government department makes: "We will fix pothole reports within 7 days." CivicPulse tracks whether they keep that promise and automatically escalates overdue issues. Like a school homework deadline — the department gets a warning if they are running late.

**Q: What happens if two people report the same pothole?**

The app has a **duplicate detection** system. Moderators can mark one report as a `duplicate_of` another. The support counts merge onto the original, giving it more weight. No duplicate issue gets lost.

**Q: Can I use this for cities outside Pune?**

Yes! The locality data (`src/data/localities.js`) is the only Pune-specific part. Replace it with your city neighbourhood data, update the map centre coordinates, and it works for any city!

---

## 💡 Did You Know?

> 🌍 **Fun Fact #1:** The interactive map in CivicPulse uses **OpenStreetMap** data, maintained by over 10 million volunteers worldwide — just like Wikipedia but for maps!

> ⚡ **Fun Fact #2:** Vite (pronounced "veet," French for "fast") can update your browser in under 50 milliseconds when you save a file. That is faster than you can blink!

> 🔒 **Fun Fact #3:** The HTTPS padlock in your browser means data is encrypted using **TLS** — a system so secure that even the most powerful computers on Earth would take millions of years to crack it by brute force.

> 🧩 **Fun Fact #4:** React was invented by Facebook in 2011 to fix a problem with their Like button count updating incorrectly. The solution became one of the most popular programming tools in the world.

> 🐘 **Fun Fact #5:** PostgreSQL (our database) has been in development since 1986 — older than the World Wide Web itself! It is one of the most trusted databases in existence.

> 🏆 **Fun Fact #6:** Supabase was built by two Australians who launched it in 2020. By 2024 it was handling databases for over 1 million developers worldwide.

> 📱 **Fun Fact #7:** Vite compresses our 945-module codebase into files totalling under 1.5MB — smaller than a single Instagram photo!

---

## 📖 Glossary of Tech Terms

> Every tech word, explained like you are 10.

| Term | Simple Definition |
|------|------------------|
| **API** | A "menu" that tells you what questions you can ask a server and how to ask them. |
| **Authentication** | Proving you are who you say you are. Like showing your school ID card before entering. |
| **Authorization** | What you are *allowed* to do after proving who you are. Only teachers enter the staff room. |
| **Backend** | The hidden part of a website — servers, databases, and logic users never see. Like a restaurant kitchen. |
| **CDN** | Content Delivery Network. Servers spread worldwide storing copies of your website so every user gets the closest copy. |
| **Component** | A reusable piece of a website interface. Like a LEGO block you can use in many places. |
| **CSS** | The language that styles a webpage — colours, fonts, spacing, layout, animations. |
| **Database** | An organised system for storing and retrieving information. Like a digital filing cabinet. |
| **Deployment** | Publishing your website so the whole world can see it. Like printing and distributing a newspaper. |
| **Encryption** | Scrambling data into unreadable code so only the intended person with the key can unscramble it. |
| **Environment Variable** | A secret setting stored outside your code in a `.env` file — like a password in a private drawer. |
| **Frontend** | Everything the user sees and interacts with in their browser. Like a restaurant dining room. |
| **Git** | A tool that tracks every change you ever make to code, like a save-game history for programming. |
| **GitHub** | A website where developers store Git repositories and collaborate. Like Google Drive but for code. |
| **HTTPS** | The secure version of HTTP. The "S" stands for Secure — it encrypts all data in transit. |
| **JavaScript** | The programming language that makes websites interactive and dynamic. |
| **JSX** | A special mix of JavaScript and HTML used in React. |
| **Library** | Pre-written code that solves a common problem so you do not have to. Like a recipe book. |
| **npm** | Node Package Manager — the app store for JavaScript libraries. |
| **OTP** | One-Time Passcode. A temporary code sent to your phone that expires after 60 seconds. |
| **PostgreSQL** | A powerful open-source database that stores data in organized tables, queried with SQL. |
| **RBAC** | Role-Based Access Control. Different people get different levels of access based on their role. |
| **React** | A JavaScript library for building interactive user interfaces out of reusable components. Made by Meta. |
| **REST API** | A way for frontend and backend to communicate using standard web requests. |
| **RLS** | Row Level Security — database rules controlling which rows a user can see or edit. |
| **Route** | A URL path that shows a specific page. `/map` shows the map page; `/profile` shows the profile page. |
| **SLA** | Service Level Agreement — a promise about how quickly something will be done. |
| **SQL** | Structured Query Language — the language for talking to a database. |
| **State** | The current "memory" of your app — what is in the feed, whether the user is logged in. |
| **Supabase** | A service providing a ready-made backend (database + auth + storage) for developers. |
| **UUID** | Universally Unique Identifier — a long random ID guaranteed to be unique across all computers. |
| **Vite** | A super-fast build tool and development server for modern web apps. |
| **Webhook** | A URL that a service calls to send automatic notifications, like a text alert system. |

---

<div align="center">

## 🌟 The Six Pillars of CivicPulse

| 🛡️ Unified Reporting | 🧠 AI Classification | 👥 Community |
|:--------------------:|:-------------------:|:------------:|
| Form, photo, or voice | Auto-categorize and route | Vote and verify |

| 📊 SLA Accountability | ⚖️ Equity Analytics | ♿ Inclusive Access |
|:--------------------:|:-------------------:|:-----------------:|
| Enforce deadlines | Expose service gaps | Multilingual and accessible |

---

**Built with love for the Community Issue Management Hackathon — 2026**

© 2026 CivicPulse | [GitHub](https://github.com/PreetTank35/CivicPluse) | MIT License

*"Most platforms stop at reporting. CivicPulse closes the loop."*

</div>
