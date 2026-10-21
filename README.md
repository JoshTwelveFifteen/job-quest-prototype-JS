# Job Quest prototype

A clickable prototype of a gamified job search journey: a personalisation quiz, results with useful tools, an introduction to the quest, an illustrated quest map with loops, an application tracker and a player profile.

This is a prototype for discussion. People, numbers and leaderboard data are examples. Progress is saved only in the viewer's browser.

## Pages

- `index.html` – start page for the personalisation quiz
- `question-1.html` to `question-5.html` – one quiz question per page (`quiz.js`)
- `results.html` – your results and tools
- `quest.html` – what the quest is and where you start
- `map.html` – the quest map and step-by-step list
- `applications.html` – track your applications
- `profile.html` – avatar, skills, trophies and community

## Editing the journey

Worlds and quests are defined in the `WORLDS` list at the top of `jq.js`. The map, profile and quest pages all read from it.
