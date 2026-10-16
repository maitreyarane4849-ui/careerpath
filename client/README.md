# CareerPath

Personalized Career Recommendation and Roadmap Generation System.

Students enter their education, skills, interests and goals. CareerPath calculates a
compatibility score for each career, finds skill gaps, and generates a trackable roadmap
with curated learning resources, projects and certifications. Reports can be downloaded
or emailed as PDFs.

## Tech stack
React, Vite, Tailwind CSS | Node.js, Express | MongoDB, Mongoose | Ollama (local LLM) | JWT, bcrypt | PDFKit, Nodemailer

## How scoring works
Score = 80% skill match + 20% interest match, calculated in `server/services/scoringService.js`.
It measures profile-to-career fit against requirements in the database. It is not a prediction
of employment or success. The AI only writes the summary and roadmap text.

## Setup
1. Install Node.js, Git, and [Ollama](https://ollama.com). Run `ollama pull llama3.2:3b`.
2. Create a free MongoDB Atlas cluster and database user.
3. Server:
```bash
   cd server
   cp .env.example .env     # then fill in your values
   npm install
   node seed/seedCareers.js
   node seed/seedResources.js
   npm run dev
```
4. Client:
```bash
   cd client
   echo VITE_API_URL=http://localhost:5000/api > .env
   npm install
   npm run dev
```
5. Open http://localhost:5173

## Limitations
Limited career coverage, AI output can be wrong, no live job-market data, resources need
periodic checking, and it does not replace human career counseling.