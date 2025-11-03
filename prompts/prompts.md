# Prompt 1: Brainstorming for initial ideas

## Context
At the start of a project I like to do some brainstorming on my own and the with some AI agents to have a lot of possibilites and decide what would work best and to decide a structure for the project

## Prompt Used

You are an expert frontend engineer and UX motion designer. I’ll give you a short product brief — produce a focused response that includes: 
1) Multiple distinct high-level concepts for a 30-second “Team Winning” Twitch-style overlay moment
2) Concrete implementation ideas and a recommended tech stack (React + TypeScript required)
3) A suggested project structure and file/component list
4) Specific animation ideas 
5) A brief development plan with estimated hours to finish in ≤8 hours
6) A short list of visual & interaction design tips to emphasize clarity and feel
7) References and libraries to use
8) A short README checklist (what to include for deliverables). Keep the answer actionable and concise — use short code snippets only when they clarify an animation or data structure. Provide 6–10 concrete suggestions total and end with a question offering to generate starter files or a sample animation component.

Here is the brief (must be respected):

Project: Hype moment
Goal: Create a short web prototype (React + TypeScript) that visually represents a “Team Winning” moment as a Twitch stream overlay.
Constraints:
Runs locally in a browser, no backend (mock data ok).
Duration ≤ 30 seconds.
Includes at least one animated element; the animation should NOT be directly clickable.
Submit within 5 days; aim for ≤ 8 hours of work total.
Deliverables to cover in output:
Repo or zip with runnable code.
README with how to run, emphasis choice and why, tools/libraries used, one improvement for more time, time spent (hh:mm), AI usage statement + /prompts folder with 1–3 prompts used and FIXES.md listing 3–5 concrete corrections made to AI output (or /decisions.md if AI not used), optional Loom link.
Allowed to use external libraries and assets, but no external APIs or real data.
Tone: practical, prioritized, and helpful — assume the reader will implement this in one weekend. Avoid high-level platitudes; prefer small, actionable technical and design recommendations.


# Prompt 2: Hype Moment Feature

## Context
Wanted to add intense visual effects when teams get close to winning to build excitement.

## Prompt Used

```
I want to add a "hype moment" feature for teams that are close to winning (85%+ progress).
Add these effects:
- Glowing aura around the character using ping animation
- Particle trail behind the character (3 colored orbs)
- Pulsing spotlight effect on the background
- Floating fire/energy emojis (🔥⚡💥✨) that rise up slowly
- "FINAL STRETCH!" text when at 95%
- Make the character 25% bigger
- Add golden highlights to the progress trail
- All effects should only show for the 1st place team
```

## What I Had to Fix

1. Emojis weren't animating - missing CSS keyframe `float-up-slow` in index.css
2. Effects only worked for 1st place, but I wanted ALL teams to get hype when close so created standar classes that would work for all teams, for example animate-subtle-shake in index.css and tailwind effects like animate-ping and animate-pulse
4. Shake effect was too aggressive, needed more subtle version so gave it an ease-in-out effect



# Prompt 3: Initial 3D Victory Scene Setup

## Context
Needed to create a 3D podium scene with animated characters for the victory screen.

## Prompt Used

```
Create a 3D victory screen using three.js with react-three-fiber. 
I need:
- Three podiums of different heights (2.5x for 1st, 1.5x for 2nd, 1x for 3rd)
- Characters standing on each podium with different animations based on rank
- Winner should show a happy face and do a backflip animation
- 2nd place should show a serious face and a standing pose clapping
- 3rd place should show a sad face crying and the character should be on his knees
- Add proper lighting and a rotating camera and a dark sky with some stars, keep the floor simple monocromatic
- Use the team colors for the podiums but in a more saturated tone
```

## Some things I had to fix

1. Camera was pointing too low - characters' heads were cut off so I look at the three.js OrbitControls documentations and found the target attribute, it was what I needed to fix it and I set it to [0, 2.5, 0]
2. Podiums were generic gold/silver/bronze instead of team colors, I had to create the saturatedColorMap object in WinAnimation.tsx with the exact colors I wanted for each team
3. Character feet were sinking into podiums so I did some adjustments to the Y offset