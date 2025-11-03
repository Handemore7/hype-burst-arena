# Hype Burst Arena 🏁

A real-time competition simulation designed for Twitch communities. Watch three teams compete in an automated hype race with dynamic animations, combo mechanics, and a 3D victory celebration.

## What is this?

Imagine a race where teams automatically gain points, combos randomly trigger for 2x multipliers so the communities would perform harder, and the tension builds as teams get close to winning. That's Hype Burst Arena. It's basically a visual way to keeps viewers engaged during streams with:

- **Combo system** - teams randomly activate 2x point multipliers (this can work with features like using points to trigger the combos)
- **Overtaking animations** - smooth position changes with visual feedback (to keep the users notified of changes in the leaderboard)
- **Hype moments** - when any team hits 85%+ progress, the track goes crazy with effects (so every team can notice and try harder)
- **3D victory screen** - animated characters on podiums celebrating or crying (I wanted to give a sensation of winning for the 1st place and humilliation for the 3rd place)

## Video that explains the app:
https://www.loom.com/share/5f127f54a1d847a3904d5d799e7e342a

## How to run it

Prerequisites: Node.js (I used v18+) and npm

```bash
# clone the repo
git clone https://github.com/Handemore7/hype-burst-arena.git
cd hype-burst-arena

# install dependencies
npm install

# start dev server
npm run dev
```

Then open `http://localhost:8080` in your browser. The game starts automatically with a 3-2-1-GO countdown. You have a debug controller at the bottom left of the screen to test it.

## What I focused on (and why)

**Visual feedback over everything.** In a stream overlay, viewers need instant understanding of what's happening. So I emphasized:

1. **Smooth animations** - No jarring movements. Teams slide into new positions with smooth transitions, overtaking has both parties animated (the overtaker shakes, the overtaken fades slightly).

2. **Progressive intensity** - The closer you get to winning, the more visual effects stack up. At 85% you get glowing auras and particle trails. At 95% the whole track shakes and "FINAL STRETCH!" appears. It builds hype for the winning team and an idea of trying harder for the other teams without needing to stop and look the details in the leaderboard.

3. **Team-coded everything** - Each team has a color that appears in their track border, progress bar, combo badge, and even their 3D podium. You can tell who's who at a glance. (At first wanted to create custom characters or emojis to give the teams some extra customization, but was more complex and added a layer of interaction to the app)

4. **Victory celebration** - Not just a banner. Full 3D scene with characters doing different animations based on placement. Winner backflips, 2nd place claps or stands calmly, 3rd place cries on his knees. Chat messages rotate above their heads.

4. **No interactions** - The idea of the overlay is for the user to see the leaderboard, just informative so no interaction needed from the user
I could've added player interaction or betting mechanics, but for a stream overlay you want "set it and forget it" - pure entertainment without requiring input.

## Tools & Libraries

- **React 18.3** + **TypeScript** - Component architecture, type safety
- **Vite** - Fast dev server and build tool
- **Tailwind CSS** - Utility-first styling, custom animations in CSS (index.css)
- **Three.js** (@react-three/fiber + @react-three/drei) - 3D victory scene with characters
- **shadcn/ui** - Base UI components (buttons, toasts, tooltips)
- **Sonner** - Toast notifications for game events
- **Lucide React** - Icons (crown, flame, trophy, etc.)

## One thing I'd improve with more time

**Sound effects and music.** Right now it's all visual, but imagine:
- Combo activation sound 
- Overtaking whoosh effects
- Background music that intensifies as teams approach the finish
- Victory fanfare when someone wins

I'd also add customization options - let streamers pick team names, colors, target points, and maybe even upload custom character emojis or use tools like 7tv and use the most used emote, that way the community is the one getting the customization. Right now it's hardcoded to 3 teams and 600 points and same emojis for all teams.

Also the 3D scene could use better lighting and character models and maybe some particle effects like confetti falling from the sky. And team chat messages could be pulled from actual Twitch chat if integrated properly.

## Time spent

Approximately **~08:00** total.

## AI Usage

I used GitHub Copilot mainly with model Claude Sonnet 4.5 (for more complex tasks) and Claude Haiku 4.5 (for small and spsecific changes) throughout development. See `/prompts` folder for details. Also used lovable for initial structure and visual settings

**Key AI assistance:**
- Initial brainstorming ideas
- Key components structure and TypeScript interfaces
- Three.js 3D scene setup (camera positioning, lighting)
- Code review and optimization suggestions

**What I did manually:**
- Game logic and state management architecture
- Visual design decisions (colors, timing, effects)
- Animation coordination and UX flow
- Debugging character positioning and podium colors and texts
- All the creative decisions about when to show effects

Check `/prompts/FIXES.md` for specific corrections I made to AI output.

---