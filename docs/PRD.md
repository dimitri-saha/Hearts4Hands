# **Hearts4Hands Website** 

### Product Requirements Document 

_Prepared by Ira  |  Draft v2  |  August 2026_ 

**_"At Hearts4Hands, we believe creativity is a form of courage. Every card we make, story we share, and dollar we raise turns imagination into hope — spreading awareness of cancer and funding the research to fight it, one colorful act of kindness at a time."_** 

## 1. Overview 

Hearts4Hands is a volunteer-driven initiative focused on cancer support and education — including making cards for children's hospitals, volunteer storytelling, and raising funds for cancer research. The organization currently has no central website. This PRD defines requirements for a new site to support three core goals: recruiting and coordinating volunteers, collecting and tracking donations, and hosting a volunteer-written blog on cancer-related experiences and education. 

## 2. Goals & Success Metrics 

|**Goal**|**What success looks like**|
|---|---|
|Volunteer recruitment & tracking|Volunteers can sign up, log hours, and submit proof of cards made;<br>submissions are reviewed for volunteer awards (e.g. Presidential<br>Volunteer Service Award)|
|Donations|Visitors can easily find and give via GoFundMe, Venmo, and PayPal;<br>site displays running total raised, split between materials and research|
|Blog / education hub|Volunteers submit posts about cancer experiences, caregiving, or<br>education; an editor reviews and publishes|



## 3. Audience 

- Prospective volunteers (students worldwide) 

- Donors and sponsors 

- Hospitals and partner organizations 

## 4. Design Direction 

The site should feel warm, hand-crafted, and kid-friendly — like stepping into an illustrated children's storybook rather than a typical nonprofit site. This tone matters because much of the audience (hospitalized children and their families) should feel comfort, not clinical formality, when they land on the page. 

#### 4.1 Visual Style 

- Overall aesthetic: a well-illustrated, crayon-drawn children's book — textured crayon/colored-pencil strokes, soft hand-drawn borders, and playful, slightly imperfect illustrations rather than sleek flat icons 

- Illustrations: hand-drawn-style hearts, hands, cards, and simple characters; used as section dividers, button accents, and page headers instead of stock icons 

- Texture: subtle paper-grain or crayon-stroke texture behind sections to reinforce the handmade feel 

- Buttons and cards: rounded, slightly imperfect edges (not sharp corporate rectangles) to feel hand-cut and friendly 

#### 4.2 Color Palette 

|**Color**|**Suggested Use**|
|---|---|
|White|Primary background—keeps pages light, airy, and easy to read|
|Red|Primary accent—buttons,headings, calls to action,heartsmotif|
|Pink|Secondary accent—highlights, hover states, decorative illustration fills|
|Brown|Grounding neutral — body text, borders, crayon-outline details (evokes warmth, like a kraft-paper<br>storybook cover)|



#### 4.3 Typography 

- Headings: a rounded, hand-lettered or storybook-style display font (playful but legible) 

- Body text: a clean, simple sans-serif for readability, especially for younger readers and older donors alike 

- Avoid dense corporate/clinical fonts — nothing that reads like a hospital brochure 

#### 4.4 Tone 

Copy throughout the site should be warm, encouraging, and simple — short sentences, friendly language, and an emphasis on creativity and hope rather than statistics alone. 

## 5. Scope — Launch (Phase 1) 

All three core areas launch together, targeted for the next few weeks. 

#### 5.1 Site Pages 

|**Page**|**Purpose**|
|---|---|
|Home|Mission statement, impact snapshot (funds raised, cards made, volunteer count), calls to action<br>for volunteering/donating/reading the blog|
|About|Organizationstory,founding, team/leadership|
|Volunteer|Explains ways to help (making hospital cards, fundraising); embeds sign-up form|
|Donate|Links out to GoFundMe / Venmo / PayPal; shows running total raised and allocation (materials<br>vs. research)|
|Blog|List of published posts (experiences, caregiving, education); individual post pages; submission<br>link/instructions|
|Contact|General inquiries, editor/partnership contact|



#### 5.2 Volunteer Sign-Up 

A simple embedded form (e.g. Google Form) feeding a spreadsheet backend — no user accounts/login required for launch. 

- Fields: name, country, state, hours logged, proof of cards made (photo/file upload) 

- Submissions land in a spreadsheet for manual review and award tracking (e.g. Presidential Volunteer Service Award thresholds) 

- Confirmation message/email on submit 

#### 5.3 Donations 

- Donate page links to external GoFundMe, Venmo, and PayPal — no direct payment processing on-site for launch 

- Manually updated total-raised tracker, with breakdown between materials and research 

#### 5.4 Blog 

- Submission model: anyone can submit a post; an editor reviews and publishes 

- Until dedicated editors are recruited (via social media), founders publish submissions 

- Categories: personal cancer experience, caregiving experience, cancer education 

- Simple submission form (title, category, author name, body text/file) 

## 6. Out of Scope (for now) 

- Volunteer accounts/dashboards with login 

- On-site payment processing (Stripe/direct checkout) 

- Automated award issuance 

- Comment sections or user accounts on the blog 

## 7. Platform & Tools Recommendation 

Given limited dev resources, a no-code approach is recommended to hit the ASAP timeline: 

- Site builder: Squarespace or Wix (supports blog, forms, custom illustrated design; no engineering needed) 

- Volunteer sign-up: Google Form → Google Sheet (free, easy to review, exportable for award tracking) 

- Blog submissions: Google Form → editor reviews → manually posts to site blog 

- Donations: external links to GoFundMe, Venmo, PayPal; manually updated total on the Donate page 

## 8. Branding 

Logo and color palette (white, red, pink, brown) already exist and should anchor the crayon/storybook illustration style described in Section 4, applied consistently across headers, buttons, and favicon. 

## 9. Open Questions 

- Who reviews/approves volunteer hour submissions, and how often? 

- How frequently will the donation total be updated, and by whom? 

- What are the content guidelines / length for blog submissions? 

- Do international volunteers need any translated content (given multilingual reach)? 

- Will illustrations be custom-commissioned, or sourced from a licensed hand-drawn/crayon-style asset pack? 

## 10. Timeline 

Target launch: within the next few weeks, with all three features (volunteer sign-up, donations, blog) live at launch. 

