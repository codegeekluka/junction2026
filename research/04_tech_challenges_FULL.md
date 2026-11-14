# Junction 2026: all tech challenges (full text)

Scraped 13 Nov 2026 from the platform API (`event.getEventSideChallenges`, which gives the description, insights and resources in markdown) and from each `/participate/45/tech-challenges/<id>` detail page (company info, judging criteria and prizes).
You can stack any number of these on top of the Meta main challenge. Select them under "Tech Challenge Participation" in the submission form and describe how you used each one.

Challenges, in order: Atech · Oxylabs · Modal · Cloudinary · CRACI · Aiven · Context.dev · Arduino Uno Q · Nemotron (NVIDIA) · Gemma · Gemini API · Codex (OpenAI) · ElevenLabs · Entire · Solana · Tiger Data · Vultr · MongoDB Atlas · Verda Compute Track

---

# Atech Real World Challenge
**By:** Atech · URL: https://hackjunction.app/participate/45/tech-challenges/29

## Description

# The API for the physical world

## Introduction

AI made software something anyone can build in an afternoon. Hardware is next. Wiring, drivers and firmware used to eat a whole hackathon before anything blinked; with Atech you describe what you want, snap the modules together and flash working firmware from your browser. At Junction we want to see what 2,000 builders do when the physical world becomes as easy to prototype as a web app.

## The Challenge

Build a physical device that solves a real problem for a real person, using Atech modules as its body and AI as its brain. Pick someone (a farmer, a nurse, a cyclist, your grandmother, your flatmate) and give them a device that senses, reacts or connects in a way software alone can't. Use Atech to go from idea to a working prototype on the table, then spend your remaining hours on what makes it great. Using Atech hardware is required; how you combine it with other tools, APIs and models is up to you.

## Minimum Requirements

- Atech modules used in the demo alongside a real-world solution
- Share a link to a summary / post about it in our [Discord](https://discord.gg/SkTkQW4De)

## Inspiration

- Assistive devices: fall detection, posture coaching, smart reminders for people living alone
- Sustainability: sensing energy, water, air quality or food waste and acting on it
- Physical AI: put an LLM or vision model in a loop with real sensors and actuators
- Robotics: give a robot arm or rover new senses with distance, IMU or climate modules
- Tools for makers, labs and classrooms that make building hardware even easier

## The Technology

**What it is?**
Atech is a kit of snap-together ESP32-based electronic modules (sensors, motion, connectivity) plus an AI platform that writes the firmware for you. You describe the device in plain language; Atech plans it, generates the code, builds it and flashes it to your hardware straight from the browser. No breadboards, no soldering, no driver hunting.

**Key Capabilities**
- Snap modules together in seconds: distance, IMU, temperature & humidity, air quality, microphone, speakers, motors, and more
- Build directly from atech.dev and flash from the browser over USB
- Python library: `pip install atech` to use any coding agent
- Test in Atech's emulator before touching hardware
- Connect devices via Wi-Fi or Bluetooth, to create an API to your AI set-ups

## Prizes and Judging

The winning team gets a special Pro Atech kit for the team to keep building. Runner-up teams get Atech kits and swag. Top teams are invited to show their project on Atech's channels and visit us in Copenhagen.

## Tech Profile

- **Type:** Hardware + AI platform
- **Languages / frameworks:** Natural language; generated C/C++ firmware (PlatformIO / ESP32), editable by hand. Python library for coding agents
- **Platforms:** Web (Chromium browser) + Atech ESP32 modules
- **Skill level:** Beginner to advanced; no embedded experience needed
- **Offline / online:** Firmware generation needs internet; flashed devices run standalone
- **Known limitations:** Browser flashing needs Chrome or Edge (WebSerial); limited kits, hopefully 2–4 per participating team

## Submission Requirements

- Live demo on the hardware
- Public GitHub repo or exported Atech project
- ~2-minute video / live demo

## About the Company

Atech is a Copenhagen-based startup making hardware as easy to build as software. Our modular electronics and AI firmware platform are used by 250+ customers, from makerspaces to university labs at Stanford, UC Berkeley, and industry R&D teams. We come from the hackathon scene ourselves and are at Junction to find builders who want to bring AI into the physical world. Strong teams can keep building with Atech after the event, and we're hiring.

## Extra Details

Atech has powered hackathons across the Nordics and the UK, including Lund AI Society, Zero to Demo and Oxford AI Society. Next on our roadmap: simulation of Atech modules in NVIDIA Isaac Sim, so teams can quickly prototype automated factory set-ups and simulate them.

## Insights

**Quickstart**

1. Pick up your team's kit at the Atech booth
2. Create an account at atech.dev and redeem code: JUNCTION
3. Snap a module onto the base board and plug it into your laptop with USB-C
4. Open the platform in Chrome or Edge and describe a first device, e.g. "Light the LED red when something is closer than 20 cm"
5. Click flash. You should see your device react in under a minute. Start building!
6. Recommended: `pip install atech`, then use your preferred coding agent

**Recommended setup**

Any laptop (macOS, Windows or Linux) with Chrome or Edge, a USB-C port (or adapter) and internet. Nothing to install. Optional: use our Python library and/or our desktop app for an improved experience.

**Tips and common pitfalls**

- Use Chrome or Edge; Safari and Firefox don't support browser flashing
- Use a data USB cable, not a charge-only one (we'll have spares at the booth)
- Start with one module working, then add the next; describe changes step by step
- On Linux, add your user to the `dialout` group if the board doesn't show up

## Resources

### Access

- **Access method:** Hardware checkout at the Atech booth + free platform account at atech.dev using code: JUNCTION
- **Where to find the code:** Challenge page in the Junction app and the Atech Discord channel
- **What they get:** Depending on demand, 2–4 Atech boards + modules per team, plus free platform access
- **Hardware:** First come, first served at the Atech booth from opening; teams return everything after final demos. Winners receive prizes.

### What we'll bring

Atech hardware kits for participating teams, free access to the Atech platform for the weekend, and the people who built it on site. Our engineers will help you from first flash to final demo, including at night.

### Resources

- **Documentation:** atech.dev/docs
- **Quickstart / tutorial:** Section E2 above + video walkthrough
- **Starter repo:** github.com/atechdotdev with example projects
- **Pre-event workshop:** Join our [Discord](https://discord.gg/SkTkQW4De)

### Support

- **Support channel:** #atech on the Junction Discord + Atech booth, or our [Discord](https://discord.gg/SkTkQW4De)
- **Mentor availability:** Throughout the event, with a night shift
- **Technical escalation (software):** julius@atech.dev
- **Technical escalation (hardware):** tomas@atech.dev

### Team background

Founders and engineers from the Atech team, including ex-Apple engineers, covering embedded hardware, AI firmware generation and product.

### Contacts

- **Main contact:** Gustav Hugod, CCO, gustav@atech.dev
- **Technical contact:** Tomas Harmer, CTO, tomas@atech.dev

### Where we show up

- X: @Atech_dev · Instagram: @atech_development · LinkedIn: /company/atech-dev · TikTok: @atech.dev · YouTube: @Atech_development

## Company info / Judging / Prizes

Website: https://atech.dev/

**Judging Criteria**
- Real-world validation of usefulness (25%): Evidence it's genuinely useful: tested with real users, experts or real-world data
- Real-world impact (25%): A real user and a real problem, solved convincingly
- Use of Atech (25%): How well and how creatively the hardware and AI platform were used
- Working demo & storytelling (25%): It runs live on the hardware in front of the judges, with a clear story and pitch
- BONUS (0%): Extra credit for combining several modules, or connecting the device to AI models and external APIs.

**Prizes**
- Best Overall: The winning team gets a special Pro Atech kit for the team to keep building.
- Runner ups: Runner-up teams get Atech kits and swag. Top teams are invited to show their project on Atech's channels and visit us in Copenhagen.

---

# Best agentic usecase of Oxylabs Web API
**By:** Oxylabs · URL: https://hackjunction.app/participate/45/tech-challenges/32

## Description

Design your project around the Oxylabs Web API: use live search and scraping to verify and inform your AI agent with what is true on the web right now.

## Introduction

AI models are brilliant but can be out of date. The moment an agent needs today's price, this morning's regulation or a page hidden behind JavaScript and bot checks, it either guesses or fails. Reliable access to the live web is essential for an agent people can trust. We are bringing our new Web API to Junction so you can build agents that know what is true right now, and can show their sources.

## The Challenge

**Challenge description:** Utilize the Oxylabs Web API in the AI agent or product you are building for your main challenge, and make it act on what is true on the web right now. Whatever problem your team tackles, live web data lets your solution check facts, track changes, compare offers and ground its answers in current, cited sources instead of stale training data. Your solution must use the Oxylabs Web API at runtime to find and read its information: search to find, scrape to read. The form is open, from a chat agent or monitoring tool to a voice assistant. Show us that it gets the answer right today and can prove where it came from.
To submit, use the same GitHub repository and demo as your main challenge, and add a short note on which Web API endpoints you used and why.

**Inspiration:**
Your solution may build on one of the ideas below, or you may come up with an entirely different use case depending on your choice of main challenge. Think of users whose decisions go wrong when information is stale: a shopper, a small business owner, a journalist, a compliance officer, a job seeker.

* **One market, different prices.** Compare the same product, service or offer across European countries using geo-targeted search and the commerce scrapers.
* **Fact-checker that reads the source.** Verify a claim by reading the full pages, not the snippets, and return a verdict with citations.
* **What does AI say about you?** Compare the answers ChatGPT, Gemini, Perplexity and Google AI Mode give on a topic with what the web says.
* **Watchers for small teams.** Track regulations, tenders, grants or competitor pages and explain what changed and why it matters.

**Minimum requirements:**

* The demo makes at least one live Web API call (/search or /scrape) at runtime. Pre-downloaded data alone does not count.
* The solution shows the source URLs behind what it states or decides.

## Resources

### The Technology

Oxylabs Web API is a REST API with two endpoints. /search finds the right pages on the live web, and /scrape reads any public page and returns it as Markdown, HTML, structured JSON or a screenshot. It handles JavaScript rendering, bot challenges, proxies and geo-targeting, so one HTTP call gives you clean data ready for your code or your LLM.

**Key capabilities:**

* Search the live web and get ranked results (title, snippet, URL), localised to any country
* Read any public page as clean Markdown, sized for an LLM context window
* Extract structured JSON from any page by describing the fields in a prompt (AI Parsing)
* Get parsed fields from 50+ dedicated scrapers: Search, Maps, Shopping and Trends, Amazon, YouTube subtitles and metadata, eBay, Walmart and more
* Query ChatGPT, Gemini, Perplexity and Google AI Mode and get their answers with cited sources
* Plug it into Claude Code, Cursor or your own agent with one command, via the MCP server or agent skills

### Getting started

1. Create a free account at dashboard.oxylabs.io.
2. Buy the Flexible plan with a price of $500. Use the Junction code (hackerpacks page) at checkout to get a full discount for the first month. **Remember to cancel your subscription once you've completed the challenge to avoid being charged monthly.**
3. Click + Add product instance, choose Web API, create it and copy the API key.
4. Export the key in your terminal: `export OXYLABS_WEB_API_KEY=your_api_key_here`
5. Follow the Manual or AI Agent integration here: https://developers.oxylabs.io/get-started/quick-start-web-api

### Recommended setup

Any OS with a terminal. Python 3.10+ with requests, or Node.js 18+ (built-in fetch); there is no SDK to install. Optional: uv for the MCP server and Node.js for the agent skills. Bring your own LLM key if your agent needs a model.

**Contacts:**
Justas Kašėta (technical contact), justas.kaseta@oxylabs.io

## Company info / Judging / Prizes

Oxylabs builds the infrastructure companies and AI teams use to collect public web data at scale, from proxy networks to scraping APIs. We are headquartered in Vilnius, Lithuania. In July, Oxylabs reached a $3.6 billion valuation, becoming Lithuania's newest tech unicorn. We are at Junction to put our new Web API in the hands of the people building the next generation of AI agents.

Website: https://oxylabs.io/

**Judging Criteria**
- Use of the Web API (30%): How well and how creatively it is used: search-to-scrape, AI Parsing, dedicated scrapers, geo-targeting.
- Real-world value (25%): A clear user and a problem that live web data solves.
- Trust (20%): Answers are current, sourced and honest about failures.
- Execution (15%): It works live in front of the judges.
- Originality (10%): Something we have not seen before.

**Prizes**
- The winning team: The winning team will receive a €1,000 Apple gift voucher, plus $500 in Oxylabs product credits for each team member to use our web data collection products and explore their potential for future projects.

---

# Best use of Modal
**By:** Modal · URL: https://hackjunction.app/participate/45/tech-challenges/40

## Description

### Take your Junction project from laptop to production AI on Modal.

**Description**
Every Junction team is building with AI, and most hit the same wall: the model runs on a laptop, but too slowly, not on a GPU, and not behind a URL the judges can open. Modal gets you past that wall. Use Modal to power the project you're already building for your main Junction challenge: serve an open model on a GPU, run your agent's code in secure Sandboxes, fine-tune a model on your own data, or fan out a big batch job, all in plain Python with no Dockerfiles, Kubernetes or YAML. We're looking for the most ambitious working AI system built on Modal, where Modal does the heavy lifting and the team spends its 48 hours on the problem. Inference, agents, sandboxes and training: your whole AI stack on one platform.

**Mentors:**
Engineers and Developer Relations from Modal with experience in inference, AI agents and code-execution sandboxes, fine-tuning and reinforcement learning, and real-time audio and video pipelines. We'll be at the Modal booth throughout the event and on the Junction Discord for debugging help.

Main contact person: Filip Makraduli, Developer Relations Engineer

## Insights

Modal was built so that a single developer can do what used to take a platform team, which makes it a natural fit for a 48-hour hackathon. Best use of Modal is a tech challenge, so you compete in it on top of your main challenge: use Modal to power the project you're already building and you can enter. The same project can enter other tech challenges too.

**What we'll bring:**
Every participant gets $100 in Modal credits for CPUs and GPUs, up to the latest NVIDIA B300s, billed per second and scaling to zero when idle. Modal is Python-native: decorate a function, run modal run, and it executes in the cloud in seconds; modal deploy turns it into an autoscaling web endpoint with a public URL ready for your demo. Teams can serve open-weight LLMs, vision-language and speech models; run untrusted, LLM-generated code in isolated Sandboxes; fine-tune or RL post-train models on one GPU or a multi-node cluster with Modal Dojo, our open-source training library; and store weights and datasets in Volumes. We'll provide a Junction starter kit of ready-to-run examples. The kick-off workshop will be at the Modal booth and announced on Discord, and Modal engineers will be on site all weekend.

## Resources

**Access and list of technologies we are bringing:**
- Modal compute credits ($100 per participant) for CPUs and GPUs: T4, L4, A10, L40S, A100 (40 and 80 GB), RTX PRO 6000, H100, H200, B200 and B300
- Modal Python SDK and CLI (pip install modal), plus JavaScript and Go SDKs for Sandboxes
- Modal Sandboxes: secure, on-demand containers for agents, code interpreters and evals
- Web endpoints (FastAPI, WebSockets, WebRTC) with autoscaling and public URLs
- Volumes, Dicts and Queues for model weights, datasets and shared state
- Modal Dojo: open-source library for fine-tuning and RL post-training open models on Modal GPUs
- Starter examples: LLM serving with vLLM and SGLang, speech-to-text, text-to-speech, vision, RAG, agents and RL
- On-site mentors from Modal engineering and Developer Relations

**To claim $100 in Modal credits:** sign up for a Modal account, then redeem the credits via the link ((link on the Junction hackerpacks page)) using the code on the Junction hackerpacks page.

The credits are valid for one year from redemption, so everyone can keep building well after the hackathon wraps up.

## Company info / Judging / Prizes

Website: https://modal.com/

**Judging Criteria**
- Effective use of Modal (40%): how central Modal is to the project and how well you use it, from GPU inference to Sandboxes, training and scaling out
- Technical ambition (25%): how hard the build is and how far you pushed it in 48 hours
- Impact (20%): how well it solves a real problem from your main challenge
- Demo (15%): a live, deployed app the judges can actually use

**Prizes**
- 1st team: $2000 in cash prize & $3000 in Modal credits

---

# Best Use of Cloudinary
**By:** Cloudinary · URL: https://hackjunction.app/participate/45/tech-challenges/41

## Description

### Build an innovative solution using one of our four tools listed on cld.media/hackathons that uses images and video to create a more engaging and intelligent digital experience.

**Description**
Images and video are central to how people discover, understand, and interact with products and services. Use Cloudinary to build a hackathon project that solves a real problem through visual content.

Your project could transform, optimize, personalize, organize, or deliver images and video in a creative way. Think about who your solution helps and how visual media can make the experience faster, smarter, or more engaging.

Check out the specific tools we'd like you to use for our challenge: https://cld.media/hackathons.

To submit your challenge, you must fill in this form: https://cld.media/hackathon-survey.

**Mentors**
- Jen Looper - Director, Developer Relations
- Balazs Kemenesi - Lead Program Manager

## Insights

To be considered for the Cloudinary challenge, hackers must enter their project into cld.media/hackathon-survey.

You do not need to build a media platform from scratch. Cloudinary handles the complex parts of media upload, management, transformation, optimization, and delivery, allowing you to focus on your idea and the problem you want to solve.

Projects can be built with any programming language or framework, as long as Cloudinary plays a *meaningful* role in the solution, not just a CDN.

**How solutions will be judged:**
Projects will be judged based on the originality and usefulness of the idea, the quality of the user experience, and how effectively Cloudinary is integrated into the solution. Judges will also consider technical execution, creativity, and the potential real-world impact of the project.

## Resources

Participants will use Cloudinary to upload, manage, transform, optimize, and deliver images and video within their hackathon projects. Cloudinary provides a generous free tier for developers to leverage our APIs and SDKs that make it easy to add powerful media capabilities to web and mobile applications.

Participants can use features such as image and video transformations, resizing, cropping, format and quality optimization, responsive delivery, and programmatic media management. Creative use of AI-powered media capabilities is also encouraged where relevant to the project.

Cloudinary mentors will be available to answer technical questions and help teams get started. Participants can explore the following resources:

- Cloudinary documentation: https://cloudinary.com/documentation
- Cloudinary Hackathon page: https://cloudinary.com/pages/hackathons/

## Company info / Judging / Prizes

Website: https://cloudinary.com/

**Judging Criteria**
- Innovation (30%)
- Technical Implementation (20%)
- UX / Design (30%)
- Impact / Usefulness (20%)

**Prizes**
- 1st: $500 worth Amazon gift cards (for your local Amazon) / team member

---

# Best use of CRACI
**By:** Craci · URL: https://hackjunction.app/participate/45/tech-challenges/42

## Description

### Make every build your first line of defence.

**Description**
Build anything you can imagine at Junction 2026, even a project made mainly for another challenge: as long as its CI/CD runs on CRACI, you can submit it to this challenge too. Switch a GitHub Actions job to runs-on: craci and every build records exactly what goes into your software, exposes that data through the CRACI API, and can fix vulnerabilities automatically with AI grounded in that exact build data. Treat all of this as raw material, not a checklist: an agent that patches your app while you sleep, a live map of everything the internet ships into your code, a tool that catches a malicious package the moment a build pulls it in, or something we have never thought of. Attackers now exploit new vulnerabilities within about a day, so the boldest ideas for software that defends itself will win. Surprise us.

**Mentors from CRACI's founding and engineering team**
Juho Niemi (CEO), Dennis Marttinen (CTO), Petteri Pulkkinen (CISO), Veeti Poutsalo (Software Engineer) and Roope Ripatti (Forward Deployed Engineer). Between them they cover CI/CD and build systems, software supply chain security, vulnerability management, AI-driven automated fixing and the CRACI API.

Find the CRACI team at the CRACI booth throughout the event!

## Insights

Severe vulnerabilities are exploding: 7,718 High or Critical CVEs were published in September 2026 alone, nearly five times as many as a year earlier. At the same time, the median time from disclosure to exploit has fallen to about a day and is projected to reach an hour by 2027. That is why CRACI runs the build itself: because it knows exactly what ships, it can stop attacks in real time and generate AI fixes grounded in exact build data.

Running your project's CI on CRACI is required to qualify.

## Resources

Every team gets free access to the CRACI platform for the whole event, CI/CD build minutes included. CRACI runners are GitHub Actions compatible, so you can keep your existing workflows and switch a job over in one line. As your builds run, CRACI records every external dependency they pull in and produces verifiable CycloneDX SBOMs, including packages restored from caches, and AI fixes can patch vulnerabilities automatically based on that exact build data. Everything is open to you through the CRACI API, and our docs ship with agent skills so you can work with them in your AI coding tools. Our whole team is on site to help you get set up and to go deep on supply chain security.

**List of technologies that we are bringing:**
- Free access to the CRACI platform during the event (platform.craci.com)
- CI/CD build minutes on CRACI's GitHub Actions-compatible runners
- Build-time CycloneDX SBOMs with completeness data per job and per cache
- AI fixes: automated vulnerability fixes grounded in exact build data
- The CRACI API: SBOMs, OCI image and cache provenance, network traces, job logs and compute usage
- Documentation, examples and agent skills: https://docs.craci.com/
- Five mentors from the CRACI team on site all weekend

### Claim your free compute

Every team gets 1000€ credits to the CRACI platform for the whole event. These can be used for CI/CD or any compute need you require. Setup takes about ten minutes.

**1. Get your invite code.** You need the Junction invite code to create your team's organization on CRACI. Get it either way:
- **Discord:** Ask in the `#craci` channel on the Junction Discord.
- **CRACI booth:** Come say hi. We'll give you the code and help with setup on the spot.

Only one person per team needs to do steps 2 to 4. Invite your teammates afterwards.

**2. Sign up and create your organization.** Go to https://platform.craci.com and sign up. Create an organization for your team and enter the Junction invite code.

**3. Connect GitHub.** In CRACI, go to **Settings → Builds** and start the **Install GitHub** flow. CRACI walks you through creating its GitHub App and installing it on your GitHub organization or account. Grant the App access to the repositories you'll build: all repositories, or a selected set. Wait until the connection shows **configured**. You can change repository access later on GitHub under **Settings → GitHub Apps → CRACI → Configure**.

**4. Run your first build on CRACI.** After connecting the app, any workflow file with runs-on: craci will be running on the CRACI platform. The default runner size is 2 vCPUs and 6GB RAM.

```yaml
jobs:
  build:
    runs-on: craci
    steps:
      - uses: actions/checkout@v4
      - run: make build
```

Push, and the job runs on CRACI. Open the build in the platform to see what it pulled in.

Need a bigger machine? Add the setup step first:

```yaml
    steps:
      - uses: cracicorp/setup@v1
        with:
          size: "8"   # 1–32 units; each unit is 1 vCPU and 3 GB RAM. Default is 2.
      - uses: actions/checkout@v4
```

You can also point your agent at our migration skill for migrating old workflows or when creating new ones: https://docs.craci.com/skills/craci/SKILL.md

**5. Get an API token.** An organization admin can create a token under **Settings → API tokens**. The token is shown only once, so store it somewhere safe. Call the API at `https://api.craci.com` with `Authorization: Bearer $CRACI_API_TOKEN`. The full OpenAPI spec is at https://api.craci.com/openapi.json.

If you or your agent needs more info, check out https://docs.craci.com/ or come yap with us at the booth! (3rd next to the stage)

## Company info / Judging / Prizes

Website: https://craci.com/

**Judging Criteria**
- Technical depth (50%)
- How creatively you use CRACI's features (50%): SBOMs, AI fixes, provenance, network traces and the API. Original ideas we have not seen before score highest, so do not just add runs-on: Craci to a project and stop there.

**Prizes**
- 1st Team: LEGO set for each team member
- 2nd Team: 24-pack of Red Bull for each team member
- 3rd Team: invite to the CRACI x OpenAI lunch event during Slush.
- Top 5 Teams: Each of the top 5 teams receives 50,000 CRACI CI/CD build minutes per team member, plus the opportunity to interview for a job at CRACI.

---

# Best Use of Aiven
**By:** Aiven · URL: https://hackjunction.app/participate/45/tech-challenges/43

## Description

Great ideas need somewhere to run, data they can use and systems that work together. Whether you're building an AI agent, an interactive game, a sustainability tool or something nobody has thought of yet, Aiven can help bring your project to life. We're looking for the most impressive use of Aiven technology: a thoughtful implementation that makes a meaningful difference to your working solution.

### Your Challenge

- Use at least one Aiven service as a meaningful part of your Junction project, and demonstrate what it enables.
- You can enter this tech challenge alongside your main challenge. Keep your chosen problem, industry and audience, and use Aiven where it helps your solution.
- Choose the services that fit your project. A well-executed use of one service can be just as impressive as a solution combining several.

You could host your app or agent on Aiven Runtime, store data in Aiven PostgreSQL, use Aiven Valkey for caching, process events with Aiven Kafka, observe your agent with Aiven ClickHouse or add search with Aiven OpenSearch.

## Resources

- **Platform:** Sign up to Aiven (https://console.aiven.io/signup) and receive $50 in free credits.
- **Documentation:** https://aiven.io/docs/
- **Runtime templates:** Popular open-source frameworks, https://templates.aiven.io/

There will also be Aiven mentors onsite all days that can help you with any questions you have around the Aiven platform or how you should architect your project.

## Company info / Judging / Prizes

Website: https://aiven.io/

**Judging Criteria**
- Meaningful use of Aiven technology (40%)
- Technical implementatation (30%)
- Impact on the Overall Solution (20%)
- Creativity (10%)

**Prizes**
- Best Use of Aiven: 1000€
- 2nd Overall: 750€
- 3rd Overall: 500€

---

# Best Use of Context.dev: Fully Structured Web
**By:** Context.dev · URL: https://hackjunction.app/participate/45/tech-challenges/44

## Description

Plug the Context.dev API into whatever you're building and give it the live web: pages, brands, companies, people and news as clean structured data in one API call.

### The Challenge

Whatever you're building, use the **Context.dev API** to extract exactly what you need from the web and nothing more.

Live web data lets your project check facts against current sources, react when a page or news story changes, brand itself from a customer's email, or enrich a company or person in one call instead of relying on stale data.

To count, your project must call **at least one Context.dev endpoint in its core flow**, not just as a side feature.

**Minimum requirements**
- Use **at least one Context.dev API endpoint** in the submitted project.
- The data from Context.dev must **visibly drive something in the demo**.

**What to submit:** a **GitHub repository and a demo of your project**, plus a short note on **which Context.dev endpoints you used and why**.

## Resources

### What we'll bring

Every team gets **50,000 Context.dev API credits that don't expire**, plus documentation, SDKs, an MCP server, live example projects and **Context.dev engineers on site** to help.

**No credit card needed.** There is no rate limit, with a maximum of **50 concurrent requests per organisation**. No special hardware is needed; the live web is your dataset.

### The Technology

Context.dev is a **web data API**. You send it a URL, a domain, a company or a search query, and it returns clean, structured data — markdown, JSON, screenshots, logos, colours, company facts and news — that your app or model can use right away. No scrapers, proxies or parsers to maintain.

**Key capabilities:**
- **Search and scrape:** turn pages into markdown, HTML, screenshots or images, or crawl and map a whole site.
- **Structured extraction:** extract JSON with your own schema, or get researched answers to a question.
- **Brand data:** get logos, colours, fonts and a style guide from a domain or email.
- **Search and enrichment:** search and enrich companies, people and news.
- **Monitors and webhooks:** react when a page or topic changes.
- **Batch processing:** process thousands of URLs.
- **File parsing:** parse PDFs and documents.
- **Social media:** scrape feeds such as TikTok and Instagram.

### Getting started

1. **Create an account** at https://context.dev/signup. Coding agents can use https://context.dev/auth.md.
2. **Redeem the Junction code (hackerpacks page)** at https://context.dev/dashboard/redeem-credits to receive **50,000 API credits per team, with no expiry**.
3. **Copy a secret key** from the API keys page (https://context.dev/dashboard/api-keys).
4. **Install the SDK:** `npm install context.dev` or `pip install context.dev`.
5. **Scrape your first page** using the code in the Quickstart (https://docs.context.dev/quickstart). You should see the Junction homepage printed as Markdown. Swap in any URL, or try brand, search, news or monitors. Start building!

**Using a coding agent?** Point it at the Agent quickstart (https://docs.context.dev/agent-quickstart), or connect the MCP server at https://mcp.context.dev/mcp (setup guide: https://docs.context.dev/install-mcp).

**Example requests and responses:**
- Scrape the Junction website to Markdown: https://gist.github.com/contextualbeer/c602446780d9270a4d817a4a677c6317
- Extract this event's details as JSON: https://gist.github.com/contextualbeer/d2a016dcd6c535e4eeffa4d6988bd403

### Recommended setup

Use **any language over HTTP**. SDKs are available for **TypeScript/Node, Python, Ruby and Go**. Bring any laptop with **Node.js 20+ or Python 3.9+** (Ruby 3.2+ and Go 1.22+ are also supported), or just curl. **Internet access is required.**

Optional tools: the context-dev CLI (https://docs.context.dev/install-cli), the agent skill (https://docs.context.dev/install-skill), or the MCP server (https://docs.context.dev/install-mcp). To try requests without code, use the Playground (https://www.context.dev/playground/scrape).

### Tips and common pitfalls

- **Check each output's `success` flag.** A 200 response can still contain a failed output.
- **Set `maxAgeMs: 0` when you need fresh data.** Results are cached for up to 3 days by default, and cached results cost the same credits as fresh ones. Store results in your own app to avoid paying for repeat calls.
- **Crawls, batches and monitors are asynchronous.** Poll the job or receive a webhook; use a service such as Cloudflare Tunnel for local webhooks.
- **Some sites block automated access.** Teams are responsible for respecting the terms of the sites they use.

### Documentation and examples

- Documentation: https://docs.context.dev
- Guides: Quickstart (https://docs.context.dev/quickstart), Agent quickstart (https://docs.context.dev/agent-quickstart), Recipes (https://docs.context.dev/use-cases/live-web-context-for-agents)
- API reference: https://docs.context.dev/api-reference/web-scraping/scrape
- Operation costs: https://docs.context.dev/account/credits
- Live examples: GPU rental price tracker https://gpu.context.dev (source: https://github.com/context-dot-dev/gpu-terminal) and Yapper leaderboard https://yappers.context.dev
- SDKs and integrations: https://github.com/context-dot-dev

There is no starter repository; start with the **Quickstart guide**.

### Mentors and support

Context.dev engineers will help with **web data extraction, search, LLM apps and large-scale data pipelines**:
- **Beer van der Drift** — CTO, challenge lead and lead judge
- **Yahia Bakour** — Founder & CEO
- **Thomas Oomens** — Engineer

**On-site availability:** Friday until 23:00 · Saturday from 09:00 until Sunday 02:00 · Sunday from 07:00 until the end

Come visit the **Context.dev booth**. Main and technical contact: **Beer van der Drift**, CTO, **beer@context.dev**. Service status: https://status.context.dev

## Company info / Judging / Prizes

Context.dev provides the web-data layer for AI: APIs that turn websites, brands, companies, people and news into structured, real-time context for software and agents. Teams like Supermemory, Mintlify and Upstash build on it. We went through YC S26 and raised a $9M seed led by General Catalyst, with investors like Paul Graham and Theo of T3. We're coming to Junction to see what the next generation of builders creates when the whole web is one API call away.

**Judging Criteria**
- Creative use of Context.dev (40%): Unusual sources, combining several endpoints.
- How central live web data is to the product (30%)
- Technical execution (30%): Accuracy, latency, handling of change over time.

**Prizes**
- 1st Place: €750 + swag
- 2nd Place: €250 + swag
- 3rd Place: Swag

---

# Best use of Arduino Uno Q
**By:** Arduino · URL: https://hackjunction.app/participate/45/tech-challenges/45

## Description

### Bring your idea to life in the physical world with Edge AI and the Arduino UNO Q.

Use the Arduino UNO Q and Modulino sensors in your hackathon project, whatever challenge you are solving. Bring Physical AI to life: run AI models directly on the device, sense the real world and make things move, light up or react.

This tech challenge is open to all teams, so you can combine it with any other Junction challenge or your own idea. Start by asking what problem you are solving and who it helps, then think about how hardware and Edge AI can make your solution tangible. The best projects combine a working physical prototype with a smart use of on-device AI.

**Mentors:** You can find them from Arduino Hardware Lab and on Discord.

## Insights

Arduino is also hosting the main challenge The Green European Renaissance, where teams use Edge AI and the Arduino UNO Q to create local solutions for a greener Europe. The Best Use of Arduino tech challenge is open to everyone, so teams working on any challenge can use Arduino to make their solution physical.

The award goes to the team that makes the best and most creative use of Arduino in their project, in any challenge. We focus on the following criteria: Use of Arduino hardware & Edge AI (50 %), Working prototype & demo (30 %), and Creativity (20 %).

**Getting the hardware:** Arduino UNO Q kits are available to borrow from the Arduino Hardware Lab. You'll find the instructions for booking and picking up your kit here: https://2026.hackjunction.com/hardware

**Submission: on Junction Platform and to Arduino Project Hub.** To be eligible for prizes, you must publish your project on the Arduino Project Hub in addition to submitting it on the Junction platform, where peer review and judging take place.
- Log in at https://projecthub.arduino.cc/
- Click + NEW PROJECT
- Select the tag Junction Finland 2026
- Fill in the required parts

## Resources

Participants can use Arduino hardware and software to build Physical AI prototypes for any Junction challenge, with Arduino mentors on-site to help with technical questions. You can find the Hardware from Arduino booth.

**Hardware we are bringing:**
- Arduino UNO Q (2 GB RAM, 16 GB eMMC)
- Arduino USB-C Cable
- Arduino USB-C Hub (8 in 1)
- USB-C Power Supply (45W)
- Arduino USB Camera
- Modulino Buzzer, Modulino Knob and Modulino Thermo sensors

Software: Arduino App Lab (https://www.arduino.cc/en/software/#app-lab-section)

What to bring: A laptop with the Arduino App Lab.

## Company info / Judging / Prizes

Website: https://www.arduino.cc/

**Judging Criteria**
- Use of Arduino hardware & Edge AI (50%)
- Working prototype & demo (30%)
- Creativity (20%)

**Prizes**
- Arduino UNO Q & Plug and Make kit for each team member: Each member of the winning team receives an Arduino UNO Q and an Arduino Plug and Make Kit.

---

# Best Use of Nemotron
**By:** NVIDIA · URL: https://hackjunction.app/participate/45/tech-challenges/46

## Description

Build a project powered by NVIDIA Nemotron that solves a real problem through reasoning, tool use, or coordinated workflows. Applies to: Any track.

### INTRODUCTION

What can you build when AI moves beyond answering questions and starts getting things done? NVIDIA invites you to use Nemotron to build a project that tackles a real problem for a clear audience. Connect it to tools, ground it in useful data, or combine it with other models to turn an idea into a working solution. Show us what Nemotron enables and why it matters to the people using your project.

### THE TECHNOLOGY

Meet Nemotron 3.5 Super VL, NVIDIA's newest open model, and it's yours to build with this weekend. It has 120B parameters but only wakes up 12B per token, so it runs fast for its size, and it can read text, images, documents and even video in a single workflow. That means your agent can look at a screenshot, read a PDF, watch a clip, call a tool and write the code to act on it, all with one model.

### THE CHALLENGE

Build a project where Nemotron plays a meaningful role in doing real work. Use it on its own or alongside other models, tools, and data sources to solve a problem for a clear audience. Nemotron must contribute directly to the project's core functionality, and your demo should make that contribution visible. The solution is open-ended: choose the problem, design the workflow, and show what your approach enables.

**Minimum Requirements:**
* Use NVIDIA Nemotron 3.5 Super VL model in the working solution.
* Demonstrate its contribution to the project's core functionality.
* Submit a short explanation identifying the model used, what it does, why it matters, and how you improved its outputs.
  * This should be done as text input into the submission form.

### GETTING STARTED

* **NVIDIA Build:** Free hosted APIs to explore, test, and prototype with NVIDIA and community AI models.
  * Note: The API is OpenAI-compatible with base URL https://integrate.api.nvidia.com/v1 (for example, model `"nvidia/nemotron-3.5-lightning-30b-a3b"`). The free tier is rate-limited (developer forums report about 40 requests per minute per key), so agent loops should use retries with backoff and each teammate should use their own key.
* **OpenRouter API:** Serverless path with a unified API across providers.
  * Note: Free variants (ending in `:free`) are capped at 20 requests per minute and 50 requests per day, or 1,000 per day once the account has bought at least 10 credits.
* **Hugging Face:** Open weights for local runs, fine-tuning or deployment on Brev.

### RESOURCES AND SUPPORT

* **Support Channel:** Nvidia Discord channel and at the NVIDIA table

### COMPANY AND CONTACTS

NVIDIA builds accelerated computing technologies and AI software that help developers turn ideas into applications. At Junction, we're inviting teams to explore NVIDIA Nemotron open models and build useful agents around real-world needs. Start with a problem you care about and show what you can do over the weekend.

* **Main Contact:** Elliot Winch, Community Program Manager, EMEA, ewinch@nvidia.com
* **Technical Contact:** (blank)
* **Mentors Attending:** Maxime Pariente and Ryan Reese
* **Judges:** NVIDIA Team

## Company info / Judging / Prizes

Website: https://www.nvidia.com/en-us/

**Judging Criteria**
- Meaningful Nemotron Usage (25%): Nemotron is central to the project's value. The team clearly explains what it does and why it matters.
- Technical Execution (25%): The demo works reliably and shows thoughtful implementation choices around architecture, data flow, tool use, latency, or error handling.
- Quality of AI Output (25%): Outputs are useful, relevant, and grounded where appropriate. The team demonstrates efforts to improve quality through prompting, evaluation, or feedback loops.
- Creativity and Differentiation (25%): The team uses Nemotron thoughtfully or inventively, with a distinct approach to the problem.

**Prizes**
- Two best teams: 1x NVIDIA RTX 5080

---

# Best Use of Gemma
**By:** Google DeepMind · URL: https://hackjunction.app/participate/45/tech-challenges/47

## Description

Awarded to the team that demonstrates the most innovative and impactful use of Google's Gemma open models. We're looking for creative applications, strong technical execution, and solutions that showcase the potential of open AI models to solve real-world problems.

## Resources

### How to Access Gemma

Gemma is Google's family of open AI models, available for developers to build with.

You can access and run Gemma through several platforms, including our Junction 2026 partners:

- **Featherless AI** (https://featherless.ai/models?families=gemma) – Access hosted Gemma models through an API.
- **Modal** (https://modal.com/) – Deploy and run Gemma models on serverless GPU infrastructure.
- **Verda** (https://verda.com/) – Use cloud GPU resources to deploy and run Gemma yourself.
- **Google AI Studio** (https://aistudio.google.com/) – Experiment with Gemma in your browser.
- **Hugging Face** (https://huggingface.co/google) – Download Gemma models and integrate them into your project.

For setup instructions and technical resources, check out the official Gemma documentation (https://ai.google.dev/gemma/docs).

Be sure to check the partner resources available in the Junction Hackerpack for any event-specific credits or access instructions.

## Company info / Judging / Prizes

Website: https://deepmind.google/

**Prizes**
- Top 3: €1,000 per team for the top 3 teams, with no ranking between winners.

---

# Best Use of Gemini API
**By:** Google DeepMind · URL: https://hackjunction.app/participate/45/tech-challenges/48

## Description

Build something extraordinary with Google's Gemini API.

This is an open innovation challenge: there are no predefined problems or industries to focus on. Whether you're building an AI agent, a developer tool, a creative application, or something entirely new, we want to see what you can create with Gemini.

The challenge is to demonstrate a meaningful, innovative, and technically impressive use of Gemini. Show us why Gemini matters to your solution and what makes your project stand out.

## Insights

We're looking for projects that go beyond simply adding an LLM to an application.

Think about how Gemini's capabilities can enable something genuinely new or significantly improve an existing solution.

Your submission should clearly explain:

- What problem you're solving and why it matters
- How you've integrated the Gemini API
- What makes your use of Gemini innovative or technically impressive
- Why Gemini is an important part of your solution

The challenge is open to all industries, use cases, and creative ideas.

## Resources

**Getting started with Gemini**

- Google AI Studio (https://aistudio.google.com/) – Get your Gemini API key and experiment with models.
- Gemini API Documentation (https://ai.google.dev/gemini-api/docs) – Documentation, examples, and integration guides.
- Gemini API Quickstart (https://ai.google.dev/gemini-api/docs/quickstart) – Build your first Gemini-powered application.

**Junction participant credits**

Google DeepMind is providing access to Gemini API credits for up to 400 participating teams.

**To receive credits your team will have to fill this form: https://forms.gle/bByXvjGkW9WZuYwW9**

Eligible teams will receive instructions for accessing their accounts during the event. API keys can be generated through Google AI Studio and used in your preferred development environment.

**Important:** Participation in this challenge and access to the Google-provided accounts are restricted to participants aged 18 or older.

**Technical support**

Visit the Google DeepMind booth during Junction for questions and guidance. Join the "Build with Google DeepMind" workshop on Friday to get started.

## Company info / Judging / Prizes

Website: https://deepmind.google/

**Prizes**
- 1st Overall: The winning team will receive 4000€, plus $1,000 in Google Cloud credits per team member.
- 2nd Overall: 2000€
- 3rd Overall: 1000€

---

# Best Use of Codex
**By:** OpenAI · URL: https://hackjunction.app/participate/45/tech-challenges/49

## Description

OpenAI challenges you to push the boundaries of what's possible with AI-powered software development.

Use Codex as part of your development process to build, iterate, and ship an ambitious project during Junction 2026.

Whether you're building AI agents, complex applications, or entirely new products, show us how Codex can accelerate your development and help you achieve more in just 48 hours.

This is an open challenge: You can participate alongside any other Junction challenge. The key is demonstrating how you've meaningfully used Codex in building your solution.

## Resources

- OpenAI Codex: https://developers.openai.com/codex
- Codex documentation: https://developers.openai.com/codex/quickstart
- OpenAI developer platform: https://platform.openai.com/docs

Exclusive Junction 2026 offer: OpenAI is providing $100 in credits per participant through unique redemption links distributed by Junction. The redemption links can be found at https://hackjunction.app/participate/45/hackerpacks.

## Company info / Judging / Prizes

OpenAI is a leading artificial intelligence research and deployment company focused on building safe, powerful AI systems that expand human capabilities. The organization prioritizes alignment, reliability, and real-world impact, ensuring that advanced models benefit individuals, companies, and society at scale. With world-class research talent, robust compute infrastructure, and cutting-edge model APIs, OpenAI empowers developers to build transformative applications. OpenAI takes part in Junction to support frontier innovation, collaborate with ambitious builders, and accelerate the creation of practical, high-impact AI solutions.

Website: https://openai.com/

**Prizes**
- 1st Overall: $10 000 API Credits
- 2nd Overall: $5000 API Credits
- 3rd Overall: $2500 API Credits

---

# MLH tech challenges (Major League Hacking)

All five share this company blurb: *Major League Hacking (MLH) is a community-focused organization that empowers student developers through hackathons, technical workshops, and hands-on learning experiences. Serving as the official student hackathon league, MLH supports events around the world by providing resources, mentorship, and a platform for students to collaborate, build innovative projects, and strengthen their technical skills.*

## Best Use of ElevenLabs
URL: https://hackjunction.app/participate/45/tech-challenges/50

Deploy natural, human-sounding audio with ElevenLabs. Create realistic, dynamic, and emotionally expressive voices for any project, from interactive AI companions to narrated stories and voice-enabled apps. ElevenLabs will empower you to build rich, immersive experiences without the need for actors or complex audio production, using simply the power of AI.

Integrate fully autonomous audio experiences into your hack with ElevenLabs and give your project a voice, along with giving your team the chance to win some wireless earbuds!

**Resources:** Claim your code at https://mlh.link/junction-26 and check how to build with ElevenLabs at https://mlh.link/elevenlabs

**Prize:** Best Overall: Wireless Earbuds

## Best Use of Entire
URL: https://hackjunction.app/participate/45/tech-challenges/51

Entire is the Git forge for agent-human collaboration. From syncing your sessions and prompts to your Git history, to hosting code and replacing the Pull Request with Trails, Entire are reimagining code hosting and collaboration for the agent era.

Ready to build faster with AI without burning through tokens or losing context? This challenge is all about building smarter AI workflows. To qualify, your project should leverage as many of Entire's core capabilities (Sessions, Graph, and/or Brain) as possible.

Your project should lean on Sessions for context and memory and entire-graph for codebase mapping:

- Sessions (Shared Memory): Save your AI agent sessions as instant checkpoints and push them to your team. Teammates or other agents can jump in instantly and pick up right where you left off with zero context loss.
- Graph (Codebase Mapping): Generate a visual map of how your codebase fits together. Using entire graph search instead of letting agents blindly search files to cut token usage by up to 71%!
- Brain (Persistent Reasoning): Combine your session data and Graph insights into persistent project knowledge. Agents can query past decisions and architectural lessons through the CLI or MCP so they don't repeat mistakes or undo working code.
- Trails (Code review): Assign you or a teammate's agent a task via Trail (Entire's issue/PR combo primitive), the agent works on it, and then let your agent review the code change: does the code change match the intent? Should it merge? Let Entire Trails help you decide!

We're looking for teams that use Entire to create seamless human-AI collaboration, maintain clean code history, and show measurable token efficiency. Build something awesome, keep your agents on track, and show us how Entire powers your workflow!

**Resources:** Claim your code at https://mlh.link/junction-26 and check how to build with Entire at https://mlh.link/entire

**Prize:** Best Overall: Mini Portable Projector

## Best Use of Solana
URL: https://hackjunction.app/participate/45/tech-challenges/52

The world of development is evolving fast and Solana is leading the charge with a network built to handle all of your infrastructure needs. Forget high fees and slow confirmations, it's time to build applications that are fast, efficient, and scalable.

Harness Solana's core advantages like blazing fast execution and near-zero transaction costs to make your hackathon ideas become real world projects. With Solana, the possibilities are endless.

- Create a game, social app, or consumer product that relies on instant, high-frequency transactions.
- Design a sophisticated trading, lending, or decentralized exchange (DEX).
- Build a prototype for supply chain, identity, or payments that can handle massive, real-world volume.

Show us how you can innovate with Solana for a chance to win Unruggable Hardware Wallets for you and each member of your team!

**Resources:** https://mlh.link/solana

**Prize:** Best Overall: Unruggable Hardware Wallets

## Best Use of Tiger Data
URL: https://hackjunction.app/participate/45/tech-challenges/53

Building high-performance apps under hackathon deadlines shouldn't mean spending half your weekend configuring complex databases or learning obscure query languages. Tiger Data extends PostgreSQL to give student developers an ultra-fast foundation for real-time data, time-series metrics, and complex analytics.

Why build with Tiger Data this weekend?
- Standard SQL Power: Query massive datasets instantly using the SQL you already know, with no complex NoSQL aggregation pipelines required.
- Unified Data Stack: Store relational user profiles and high-frequency metric streams side-by-side in a single database.
- Instant Dashboards: Serve lag-free, real-time frontend charts using pre-computed Continuous Aggregates.
- 90%+ Data Compression: Store millions of events on free-tier cloud instances without running out of disk space.

Whether you're building real-time IoT monitoring, AI-driven analytics dashboards, or financial prediction engines, show us how Tiger Data powers your project. The team that demonstrates the most innovative, impactful, and performance-driven use of Tiger Data will take home some great prizes!

**Resources:** https://mlh.link/tigerdata

**Prize:** Best Overall: Stream Deck Mini

## Best Use of Vultr
URL: https://hackjunction.app/participate/45/tech-challenges/54

Vultr empowers hackers to bring their high-performance projects to life instantly; providing everything from the speed of one-click deployment and scalable cloud compute, to specialized Vultr Cloud GPUs that can power AI-driven applications. We want you to push the limits of what can be built when infrastructure is no longer the bottleneck!

Sign up for a Vultr account today and claim your free cloud credits! Take your next hack to the cloud with Vultr for a chance to win some awesome prizes for you and your team!

**Resources:** https://mlh.link/vultr

**Prize:** Best Overall: M5Stack mini programmable monitor

## Best Use of MongoDB Atlas
URL: https://hackjunction.app/participate/45/tech-challenges/55

MongoDB Atlas takes the leading modern database and makes it accessible in the cloud! Get started with a $50 credit for students or sign up for the Atlas free forever tier (no credit card required). Along with a suite of services and functionalities, you'll have everything you need to manage all of your data, and you can get a headstart with free resources from MongoDB University! Build a hack using MongoDB Atlas for a chance to win a M5Stack IoT Kit for you and each member of your group.

**Resources:** https://mlh.link/mongodb

**Prize:** Best Overall: M5Stack IoT Kit

---

# Verda Compute Track
**By:** Verda · URL: https://hackjunction.app/participate/45/tech-challenges/56

## Description

### INTRODUCTION

From electron to token, it takes decades of progress to run AI. Add scale, efficiency, and sustainability, and AI becomes a monumental achievement.

Verda brings everything together.

We make compute, storage, and networking work in unison to squeeze peak performance, hosted in European data centers and utilizing 100% renewable energy. We develop services for you to utilize computational power most efficiently, no matter your use case.

The end result is a cloud platform trusted by the world's leading AI labs and frontier researchers. The best thing is you get to use the same next-gen compute for free at Junction 2026.

### BOUNTY: BEST USE OF VERDA

Pick any challenge at Junction and use Verda products to build something you couldn't build on a laptop. Then show us how far it goes.

* **Teach a humanoid to move**. Train locomotion or manipulation policies for Aalto's Unitree G1 in simulation, at scale, before your shot at the real robot.
* **Turn demonstrations into a brain**. Train imitation-learning or VLA policies from robot-arm demos in the Ignite × Intel challenge, or from Rokoko motion-capture teleoperation data.
* **Make an agent stronger than it was on Friday.** Run thousands of rollouts in your AfterQuery RL environment and fine-tune a smaller model on the experience.
* **Read the whole internet's encyclopedia.** Embed MariaDB's full Wikipedia dataset with batch jobs and serve a RAG assistant on top.
* **Keep sensitive data in Europe.** Run open-weight models for a banking coach or a recruitment tool on infrastructure you control, instead of sending data to someone else's API.

**Or surprise us.** Anything that needs serious compute counts. (Anything except crypto mining. We've seen it, and it gets you banned.)

**What we're looking for**
* An ambitious idea where compute is what makes it possible
* The right Verda product for the job, and a clear reason why you chose it
* Your path from first idea to working prototype
* Bonus points: show how your solution would scale from a hackathon demo to real users

**Minimum Requirements**
* Document your process
* Share a link to a summary → Post it in our Discord channel

**The Technology**
* Inference API for serving out-of-the-box open-weight models within your application.
* GPU instances or Instant clusters for training or fine-tuning tasks.
* CPU instances for hosting agentic applications.
* Auto-scaling containers for hosting models where scale and costs matter.
* Batch jobs for long-running tasks in the background.

**Prizes and Judging:** The winning team gets 10,000 USD in cloud credits and Verda hoodies. Runner-up teams in second and third places get 2,500 USD in cloud credits.

## Resources

### What we'll bring

* **Inference API:** serve open-weight models in your app with zero setup
* **GPU instances and Instant Clusters:** for training and fine-tuning when one GPU isn't enough
* **CPU instances:** to host your agents and backends
* **Auto-scaling containers:** deploy models where scale and cost matter
* **Batch jobs:** run long jobs in the background while you sleep (or don't)
* **NVIDIA Nemotron endpoint:** hosted by Verda together with NVIDIA
* **Free credits for every team:** scan the QR code on your table or go to verda.com/blog/junction-2026

**Mentors on-site during the entire weekend**, meet us on the third floor at Booth 6! Start with the **"Getting started with Verda"** workshop on Friday at 20:30, right after the opening ceremony: sign-up, credits, every product, and how to use them.

## Company info / Judging / Prizes

Website: http://verda.com/

**Judging Criteria**
- Ambition (25%): How much did compute let you do that you otherwise couldn't?
- Fit (25%): Did you pick the right Verda services and use them well?
- Working prototype (25%): Does it run, and is the process documented?
- Path To Scale (25%): Is there a credible way from demo to real users?

**Prizes**
- 1st Place: $10,000 in Verda cloud credits + Verda hoodies
- 2nd Place: $2,500 in cloud credits
- 3rd Place: $2,500 in cloud credits
