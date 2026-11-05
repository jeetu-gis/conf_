# 🎤 Tech Talks: Slides, Code & Resources
 
Welcome! This repo has everything from my tech talks: slide decks, demo code, sample data, and links for further reading. If you saw one of my talks, you're in the right place.


## ⬇️ How to Download
 
**Option 1: Clone the whole repo**
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```
 
**Option 2: Download a ZIP (no Git needed)**
Click the green **Code** button at the top of this page, then **Download ZIP**.
 
**Option 3: Grab just one talk folder**
```bash
git clone --filter=blob:none --sparse https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
git sparse-checkout set talks/YYYY-MM-talk-name
```


**Note:**
- Demo code is written to **teach**, not for production. Expect shortcuts.
- If a demo needs an API key, look for a `.env.example` file. Copy it to `.env` and add your own key. **Never commit real keys.**
- Code is tested against the versions listed in each talk's README. Newer library versions may need small tweaks.
