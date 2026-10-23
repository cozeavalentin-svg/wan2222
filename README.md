# WanMotion Hub - RunningHub Queue Manager

Manager automatizat de coadă pentru workflow-uri **Wan 2.2 Motion Control** pe **RunningHub**.
Aplicația gestionează automat un set de date mare cu generare de câte **2 video-uri simultan** (concurrență RunningHub), preia automat output-urile descărcabile și lansează imediat următoarele video-uri din coada de așteptare.

---

## 🚀 Publicare pe GitHub Pages (Ghid Pas cu Pas)

Aplicația este deja configurată pentru deployment direct și automat pe **GitHub Pages**!

### Metoda 1: Automată (Recomandată via GitHub Actions)
1. Fă un repository nou pe GitHub (de ex. `wanmotion-hub`).
2. Fă push la codul din proiect pe branch-ul `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - WanMotion Hub"
   git branch -M main
   git remote add origin https://github.com/<utilizatorul-tau>/wanmotion-hub.git
   git push -u origin main
   ```
3. În repository-ul tău de pe GitHub, mergi la:
   - **Settings** → **Pages**
   - La secțiunea **Build and deployment** → **Source**, alege: **GitHub Actions**.
4. GitHub Actions va rula automat workflow-ul inclus (`.github/workflows/deploy.yml`) și aplicația va fi live la adresa:
   `https://<utilizatorul-tau>.github.io/wanmotion-hub/`

---

### Metoda 2: Build Manual (Static)
Dacă vrei să urci direct folderul compilat:
```bash
npm install
npm run build
```
Folderul `dist/` conține toate fișierele statice (HTML, JS, CSS) configurate cu căi relative (`base: './'`), gata de găzduire pe GitHub Pages, Cloudflare Pages, Netlify sau Vercel.

---

## ⚙️ Cum funcționează apelurile RunningHub API pe GitHub Pages

- **Pe server local / Cloud Run**: Aplicația folosește proxy-ul intern Express (`server.ts`) pentru a preveni blocajele CORS.
- **Pe GitHub Pages**: GitHub Pages servește doar fișiere statice (HTML/JS). Aplicația detectează automat când rulează pe GitHub Pages (`*.github.io`) și direcționează apelurile API prin mecanismul universal integrat, asigurând funcționarea atât în modul **Simulator / Test**, cât și în modul **Live RunningHub API**.

---

## 🌟 Funcționalități Principale

- **Concurrență 2 Sloturi**: Menține întotdeauna 2 generări active pe RunningHub.
- **Auto-Dispatch**: De îndată ce o generare se finalizează, video-ul MP4 este preluat și următorul slot din coadă pornește instant.
- **Sloturi Multiple & Batch Matcher**: Încarcă loturi de poze și video-uri simultan; sistemul le împerechează automat.
- **Side-by-Side Comparison**: Player triplu sincronizat (Video Referință vs Poză Referință vs Video Generat Wan 2.2).
- **Galerie & Export**: Vizualizare și descărcare individuală sau în masă a tuturor generărilor.
