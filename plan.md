Build a polished personal productivity and career-tracking web app called **"SDE Journey"** for a 3rd-year IT student preparing for 2027 placements.

The core purpose is NOT just habit tracking. The app should help me **log my day, objectively reassess how I spent my time, identify where I failed or improved, and adjust the next day's plan**.

## 1. Core Philosophy

The app should answer these questions every day:

1. What did I plan to do?
2. What did I actually do?
3. Where did my time go?
4. What did I accomplish?
5. What did I avoid?
6. Why did I fail to complete something?
7. What did I learn?
8. What should I change tomorrow?
9. Am I moving toward my placement goal?

Avoid gamification that encourages meaningless streaks. Focus on honest reflection, consistency, measurable progress, and long-term improvement.

---

# 2. Dashboard

Create a clean dashboard showing:

### Today's status

* Today's date
* Current day
* Days remaining until placement season
* Overall weekly completion %
* Today's planned study hours
* Today's actual productive hours
* Current streak
* Weekly trend

### Career progress

Show progress bars for:

* Java
* DSA
* SQL
* Spring Boot
* PostgreSQL
* Backend Engineering
* System Design
* CS Fundamentals
* Docker/Cloud
* AI-assisted Engineering

Allow these categories to be edited later.

### Today's priority

Show the top 3 tasks for today.

---

# 3. Daily Planning

Provide a "Plan My Day" section.

Allow me to create tasks with:

* Task name
* Category
* Priority
* Estimated duration
* Planned start time
* Planned end time

Categories:

* DSA
* Java
* Spring Boot
* SQL
* CS Fundamentals
* Project
* AI
* College
* Internship/Placement
* Personal
* Other

Allow tasks to be reordered.

Show:

**Planned productive hours**

before the day begins.

---

# 4. Daily Logging

At the end of the day, provide a simple guided form.

### Section A — What actually happened?

For every planned task:

* Completed
* Partially completed
* Skipped
* Rescheduled

If partially completed, ask:

"How much did you complete?"

Allow actual duration to be entered.

Also allow adding unexpected activities that were not planned.

---

# 5. Time Audit

Create a visual breakdown of the day.

Track:

* Productive study
* College
* Project work
* DSA
* Entertainment
* Social media
* YouTube
* Gaming
* Travel
* Personal
* Other

Show:

### Planned vs Actual

Example:

Planned study: 5 hours
Actual study: 3.5 hours

Then show where the remaining time went.

Do NOT shame the user.

The purpose is diagnosis, not punishment.

---

# 6. Daily Reflection

Ask these questions one at a time rather than showing a giant form.

### Question 1

"What was the most valuable thing you accomplished today?"

### Question 2

"What important thing did you fail to do?"

### Question 3

"Why didn't you do it?"

Provide selectable reasons:

* Poor planning
* Too much workload
* Distraction
* Phone/social media
* Task was difficult
* Didn't understand the topic
* Low energy
* Unexpected college work
* Procrastination
* Other

Allow a custom answer.

### Question 4

"What did you learn today?"

### Question 5

"What mistake should you avoid tomorrow?"

### Question 6

"What is the ONE thing that would make tomorrow successful?"

---

# 7. Daily Self-Assessment

Ask me to rate myself from 1–10 on:

* Focus
* Discipline
* Learning
* Productivity
* Technical progress
* Energy

Then calculate an overall score.

Do NOT make the score the main objective.

Show the individual dimensions so I can identify weaknesses.

---

# 8. AI Daily Review

Add an AI-powered "Reassess My Day" feature.

After I submit the day's data, the AI should analyze:

### A. Reality check

Compare planned vs actual.

Example:

"You planned 5 hours of technical work and completed 3.2 hours."

### B. Pattern detection

Look across previous days.

Example:

"You have skipped DSA 4 times in the last 7 days."

### C. Root cause

Identify recurring reasons for failure.

Example:

"Your main issue appears to be over-planning rather than lack of available time."

### D. Career alignment

Evaluate whether today's work contributed toward the long-term SDE goal.

Example:

"Today's Spring Boot work directly contributes to your backend specialization."

### E. Recommendation

Give 3 concrete recommendations for tomorrow.

Keep recommendations practical.

Never give generic motivational quotes.

---

# 9. Tomorrow's Adjustment

After the AI review, automatically suggest tomorrow's plan.

For example:

Instead of:

5 hours DSA
3 hours Spring Boot
2 hours project

suggest something realistic based on previous performance.

Show:

### "Tomorrow's Recommended Plan"

* 90 min DSA
* 90 min Spring Boot
* 2 hr project
* 45 min SQL

Allow me to accept, edit, or reject the recommendations.

The AI must learn from my historical completion rate.

If I repeatedly plan 6 hours but complete 3 hours, recommend approximately 3–4 hours rather than continuing to generate unrealistic plans.

---

# 10. Weekly Review

Every 7 days generate a Weekly Review.

Show:

### Productivity

* Planned hours
* Actual hours
* Completion %
* Average daily productive time

### Technical progress

Number of sessions/hours spent on:

* DSA
* Java
* Spring Boot
* SQL
* Project
* CS fundamentals
* AI

### Behavioral patterns

Identify:

* Most productive day
* Least productive day
* Most common distraction
* Most frequently skipped category
* Most consistent habit

### AI assessment

Give:

**What improved this week**

**What got worse**

**Biggest bottleneck**

**What to change next week**

**One priority for next week**

---

# 11. Monthly Career Review

Create a monthly dashboard comparing progress against the placement roadmap.

For example:

### DSA

Target: 150 problems
Current: 87

### Java

Beginner → Intermediate → Strong

### Spring Boot

Beginner → Intermediate → Strong

### SQL

etc.

Allow targets to be changed.

Show a timeline toward the placement date.

---

# 12. DSA Tracker

Create a separate DSA page.

Track:

* Problem name
* Platform
* Topic
* Difficulty
* Date solved
* Time taken
* Solved independently?
* Needed hint?
* Needed solution?
* Reattempt date
* Confidence 1–5

Topics:

Arrays
Hashing
Two Pointers
Sliding Window
Stack
Binary Search
Linked List
Trees
Heap
Graphs
Greedy
Backtracking
Dynamic Programming

Show:

* Problems solved
* Problems mastered
* Weak topics
* Reattempt queue

Important:

"Problems solved" and "Problems mastered" must be separate metrics.

---

# 13. Project Tracker

Create a project page for my main SDE project.

Track:

* Project name
* Goal
* Architecture
* Features
* Tasks
* Bugs
* Technologies
* Deployment status

Allow tasks to have:

* Todo
* In Progress
* Completed

Show project progress.

---

# 14. Distraction Tracking

Create a lightweight distraction tracker.

Allow me to record:

* Social media
* YouTube
* Gaming
* Random browsing
* Phone
* Other

Ask:

"Was this intentional?"

and:

"How long?"

Generate weekly patterns.

Do not use guilt-based language.

---

# 15. Calendar / History

Create a calendar where each day has a simple status:

* Excellent
* Good
* Average
* Poor
* Not logged

Clicking a day opens its full journal.

Allow searching previous reflections.

---

# 16. Database

Use PostgreSQL/Supabase.

Store:

* users
* daily_plans
* tasks
* task_logs
* time_logs
* daily_reviews
* reflections
* goals
* skills
* dsa_problems
* projects
* weekly_reviews

Ensure data is persistent.

---

# 17. UI/UX

Make the UI minimal, modern and calm.

Avoid excessive gamification.

Use:

* clean cards
* progress indicators
* charts
* calendar
* responsive layout
* dark/light mode
* keyboard-friendly forms

The dashboard should not feel like a corporate project management tool.

It should feel like a **personal command center**.

---

# 18. Most Important UX Feature

At night, I should be able to open the app and complete my daily review in approximately **5 minutes**.

Use progressive disclosure.

Don't show 30 fields at once.

Flow:

Plan → Log → Reflect → Reassess → Adjust tomorrow.

Make the process extremely fast.

---

# 19. AI Rules

The AI should NOT:

* give generic motivational speeches
* shame me for poor productivity
* invent achievements
* blindly recommend more work
* optimize only for hours

The AI SHOULD:

* use historical data
* identify patterns
* compare planned vs actual
* identify realistic workload
* detect recurring problems
* prioritize consistency
* connect daily actions to long-term goals
* recommend specific adjustments

The AI should behave like a **strict but rational mentor**, not a motivational coach.

---

# 20. Initial Career Goal

Prepopulate the app with:

**Goal: Secure a strong SDE role during the 2027 placement cycle.**

Initial roadmap:

1. Java + DSA
2. SQL + DBMS
3. Spring Boot
4. PostgreSQL
5. Redis
6. Kafka
7. Docker
8. AWS
9. System Design
10. AI-assisted software engineering

Make all goals editable.

---

# 21. Important Analytics

Add a "Reality vs Plan" chart.

Track over time:

**Planned hours vs actual hours**

Also:

**Technical progress vs time spent**

And:

**Consistency over 7/30/90 days**

The goal is to help me answer:

> "Am I actually progressing, or am I just staying busy?"

---

# 22. Final dashboard insight

At the top of the dashboard, show one dynamic sentence generated from my data.

Examples:

"You're consistent, but you're over-planning by ~35%."

"Your DSA consistency improved this week."

"You're spending significant time learning but not enough time building."

"Your backend progress is strong; SQL is becoming a bottleneck."

This should be based ONLY on actual stored data.

---

# 23. Technical requirements

Build this as a production-quality web application.

Preferred stack:

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* Next.js API routes or appropriate backend architecture

Database:

* Supabase PostgreSQL

Authentication:

* Supabase Auth

Charts:

* Recharts

AI:

* Make the AI provider configurable through environment variables.
* Create a clean abstraction so the model/provider can be changed later.

Deployment:

* Vercel-compatible

Use proper:

* authentication
* authorization
* database security
* error handling
* loading states
* empty states
* form validation
* responsive design

Do not build a mockup.

Build the actual functional application with persistent data.

Start with the dashboard, daily workflow, database schema and authentication. Then implement analytics and AI reassessment.
