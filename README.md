<div align="center">
  <img src="static/assets/logo.png" alt="Journal iT Logo" width="120" />
</div>

<h1 align="center">Journal iT</h1>

Journal iT is a calm, minimal, and private digital journaling destination. It features two core parts: a clean authentication landing page to ensure privacy, and an interactive dashboard where you can store, reflect, and manage your daily life with a paper-like aesthetic.

## Features

- **Dashboard & Organization**:
  - **Calendar Interface**: Navigate your entries seamlessly using the interactive date and month grids.
  - **Right Panel Overview**: Keep track of your journaling stats such as total entries, average words, personal daily prompts, and recent activity history.
  - **Sidebar Summary**: Get a bird's-eye view of your mood over time and maintain your journal writing streaks.

- **Distraction-Free Editor**:
  - **Rich Text Experience**: Write your journal entries in a beautifully designed, typography-centric editor (leveraging Google Fonts' Lora & Inter for a diary-like feel).
  - **Mood Tracking**: Log how your day went with built-in mood selectors (Happy, Neutral, Sad, Angry) directly connected to your entry.
  - **Precision & Formatting**: Never lose a thought with word/character counting, and explore deep focus by opening the full-screen mode for advanced alignment and text styling controls.

- **Privacy & Security**:
  - **Secure Login**: Protected by Firebase Authentication with Google Sign-in to ensure no one but you reads your thoughts.
  - **Cloud Sync**: All data sits safely in your private Firebase Firestore database, synced continuously across sessions.

## Technologies Used

- **Backend**: Python, Flask
- **Frontend**: HTML5, Vanilla CSS (CSS Variables), Vanilla JS (ES Modules)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google Provider)
- **Design Elements**: Google Fonts (Inter & Lora), Material Symbols

## Local Setup and Installation

Follow these steps to get the application running on your local machine.

### 1. Prerequisites
- Python 3.7+
- pip (Python package installer)
- A Firebase Project (with Firestore, web app registered, and Google Auth enabled)

### 2. Clone the Repository

Clone this repository to your local machine:
```bash
git clone https://github.com/sujalnegi/jackpot.git
cd jackpot
```
*(Note: adjust your directory name to match the repo, e.g., `jackpot1-ag`)*

### 3. Install Dependencies

Create a virtual environment (optional but highly recommended) and install the Python dependencies:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Configure Firebase Keys

1. Rename `.env.example` to `.env` if you plan to use Flask server-side secrets (or copy it).
2. Configure your client-side Firebase keys in `static/js/firebase-config.js` by pasting your Web App configuration object from the Firebase Console (found under Project Settings → Your apps → Web). 
3. *Note*: Also remember to update Firestore Security Rules (`firestore.rules`) to make sure your journals collection is locked down by `request.auth.uid`.

### 5. Run the Application

Start the Flask development server:
```bash
python app.py
```
Now open your web browser and go to the following address:
http://127.0.0.1:5000/

You should see Journal iT running!

## How to Use

- **Start**: Click "Continue with Google" on the main landing page to securely log in.
- **Dashboard Mode**:
  - **Navigate Dates**: Use the left sidebar mini-calendar or the main central calendar blocks to discover empty or filled days.
  - **Track Stats**: Check your Right Panel for daily writing prompts, previews of your journal, and statistical insights.
- **Writing Mode**:
  - **Create Entry**: Click on a day block to bring up the dialogue box. 
  - **Set Mood**: Select your prevailing mood using the top emoji buttons.
  - **Deep Focus**: Click "Open Full Editor" to write extensively with rich text styles.
  - **Save**: Entries are synced when you submit. Click "Done" to close the dialogue view.

## Author

- **Email**: sujal1negi@gmail.com
- **Instagram**: @sujal1negi

## Acknowledgments/Credits

- Minimal UI and aesthetic inspiration drawn from traditional physical diaries.
- Icons provided by Google Material Symbols.
- Real-time backend foundation powered by the Firebase community.
