# DreamServer Hardware Finder 🪄

A lightweight, fully static quiz that helps users discover which AI model their hardware can run with [DreamServer](https://github.com/Light-Heart-Labs/DreamServer). Answer 4 questions, get a personalised hardware tier, recommended model, and a direct link to install.

**Live demo:** https://devkalra.github.io/find_dreamserver/ 🔗

---

## Project Structure

```
dreamserver-quiz/
├── index.html          # Markup only — no inline JS or CSS
├── css/
│   └── styles.css      # Design tokens, layout, all component styles
├── js/
│   ├── quiz-data.js    # Questions, use-case labels, result logic (getResult)
│   ├── quiz.js         # State, render loop, interactions, boot animations
│   ├── typewriter.js   # Typewriter animation for the h1 heading
│   ├── confetti.js     # Canvas 2D confetti burst on result
│   └── background.js   # Three.js floating particle field + mouse parallax
└── README.md
```

## Contributing

This quiz is a community tool for the DreamServer project. If you spot a model recommendation that's out of date, the fix is a one-line change in `quiz-data.js` — pull requests welcome.

For DreamServer itself, see the main repo: [github.com/Light-Heart-Labs/DreamServer](https://github.com/Light-Heart-Labs/DreamServer)

---
