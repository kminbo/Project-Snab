![alt text](image.png)
## Theraspell
**Where conversation turns into comfort**

---

## Inspiration

We were motivated by growing concerns around how chatbots can unintentionally facilitate self‑harm among younger users, alongside rising feelings of isolation within Gen Z. At the same time, traditional therapy remains stigmatized and inaccessible for many. We wanted to explore a safer, more supportive alternative; one that reframes emotional support as companionship, reflection, and everyday care rather than formal treatment.

---

## What it does

- Provides a conversational companion designed to support users’ emotional and mental well‑being
- Includes a medically informed chat experience focused on support, not diagnosis
- Features a dynamic side panel that adapts in real time to the conversation
- Recommends interactive activities such as:
    - Guided games
    - Mind‑mapping tools
    - Visualization exercises

Activity recommendations are based on the emotional context of the user’s messages which offers multiple outlets for expression and relief, beyond conversation alone.

---

## Core Features

### 1. AI Mental Health Coach (Gemini-powered)

The central feature is a CBT-based chatbot that operates in two phases:

- **Phase 1 - Diagnosis**: Asks clarifying questions to categorize the user's emotional state into one of three buckets:
  - **Specificity** (a specific event)
  - **Complexity** (tangled relationships/patterns)
  - **Simplicity** (raw emotion)
  
  Based on this, it recommends a therapeutic tool.

- **Phase 2 - Therapy/Coaching**: Once the user engages with a tool, the chatbot pivots to gentle CBT-style questioning, challenging avoidant thinking, offering evidence-based alternatives, and encouraging real-world engagement when the user feels better.

The bot is explicitly designed to never validate harmful decisions (e.g., substance use for coping, avoidance behaviors, staying in toxic cycles).

### 2. Interactive Side Pannel

Three interactive therapeutic tools integrated into the chat experience. User messages are processed by a theme classification module (analyzeTheme) that selects the most relevant tool. Upon user confirmation, the system dynamically reorders the sidebar and routes the interface to the selected tool, enabling a seamless, context‑aware guided workflow.

**Game Suite** (5 Games where each game serves a specific emotional regulation purpose):
- Dragon Flyer - Calming, emotion regulation
- Crystal Race - Energizing, focus & goal-orientation
- Glitter Maze - Gentle focus & curiosity
- Magic Paint - Users draw a sketch, and Gemini's image generation model transforms it into "beautiful, soothing, healing artwork with calming colors", a creative therapeutic outlet.
- Star Catcher - Relaxation & gentle rhythm

Games move dynamically, showcasing the best recommendation based on further emotional context.

**Visualizer**

Helps users recognize patterns in emotions or behavior (for specific events).

**Mind Map** 

Helps organize complex thoughts, connections, and triggers (for complex relationship patterns) through emotion wheels, timelines etc.

### 3. User Friendly Customizations

- Real‑time streaming chat with a typewriter effect for a natural, human‑like conversational flow
- Voice output via ElevenLabs TTS (Rachel), delivering warm, conversational spoken responses for accessibility and immersion

---

## How we built it

- Defined the problem early: identified the risks of relying on chatbots for emotional support and aligned on building a safer, more grounded alternative
- Planned before coding: held detailed team discussions, created sketches, flowcharts, and diagrams to agree on necessary features and implementation
- Started ambitious: initially planned an LLM‑driven social simulation system with a React + TypeScript frontend, Django backend, and persistent user data
- Iterated based on feasibility: ongoing discussions revealed the scope was too complex, leading us to reassess and cut non‑essential features
- Chose simplicity intentionally: removed persistent user data to keep sessions independent and comforting, and dropped the Django backend in favor of a React + Vite frontend
- Refocused the experience: abandoned explicit modeling of complex relationships in favor of a calm, conversation‑first experience with session‑based activities
- Shifted complexity to the agent: built an agentic therapy system powered by Google Gemini using dynamically situational, psychologically informed context engineering
- Final outcome: a context‑aware, adaptive conversational companion that goes beyond basic therapist role‑play while remaining simple, safe, and user‑focused

---

## Challenges we ran into

- Safety vs approachability: balancing emotional safety with a companion‑like tone without becoming clinical or encouraging unhealthy reliance
- Meaningful interactions: designing side activities that felt genuinely helpful rather than gimmicky
- Activity recommendation errors: context‑engineered chatbot suggested activities that did not exist, requiring tighter constraints and explicit tool mapping
- System complexity: building a polished UI, a context‑aware chatbot, and multiple interactive tools in parallel proved highly ambitious
- Scope management: risk of overbuilding led us to reassess priorities mid‑development
- Strategic automation: automated lower‑priority components (UI scaffolding, side activities) to focus effort on LLM behavior
- Core focus: refining the LLM to deliver safe, psychologically grounded responses and accurately recommend the appropriate activity based on user state

---

## Accomplishments that we're proud of: 

- Created a non‑stigmatizing approach to emotional support centered on companionship
- Designed interactive tools that complement conversation rather than replace it
- Built an experience that prioritizes safety, reflection, and user agency
- Implemented mental‑health‑tuned safety settings using Gemini harm thresholds

---

## What we learned

- Upfront planning matters: designing the UI and documenting application functionality early gave the team a shared mental model, reduced ambiguity, and prevented major implementation mistakes.
- Clear structure enables parallel work: well‑defined layouts and feature flows allowed team members to build individual components confidently and efficiently.
- LLMs are inherently unpredictable: even with careful context engineering, models can produce undesired outputs, reinforcing the need for safeguards, constraints, and iterative testing.

---

## What's next for Theraspell

Our next step is evolving Theraspell into a Duolingo‑style experience—one that encourages consistency without pressure. Instead of daily lessons, the app will offer affirmations, gentle prompts, and reflective activities tailored to users’ past conversations, promoting slow, sustainable healing and a sense of ongoing companionship.

---

## Team members

- Scarlett O’Shaughnessey
- Ananya Jain
- Bomin Kim
- Nikhil Bhagwat