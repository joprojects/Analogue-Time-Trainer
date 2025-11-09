# Analogue Time Trainer

An elegant, modern web application designed to help adults learn and practice reading analog time without childish themes. The app provides a focused, brand-neutral, and progressively challenging learning experience.

## Features

*   **Six Progressive Difficulty Levels:** Start with a fully-guided clock face and gradually move to abstract challenges, including a randomly rotated clock face to test pure angle perception.
*   **Three Distinct Game Modes:**
    *   **Read Mode:** The classic experience. Read the time on an analog clock and type in your answer.
    *   **Match Mode:** Test your recognition skills. You're given a digital time and must select the matching clock from six different options.
    *   **Set Mode:** A hands-on challenge. You're given a digital time and must set the clock hands yourself using an intuitive "virtual crown" slider.
*   **Targeted Practice:** Focus your sessions on what you need to improve most:
    *   **Hours:** Practice reading only the hour hand (the minute hand is hidden).
    *   **Minutes:** Practice reading only the minute hand (the hour hand is hidden).
    *   **Both:** Practice reading the full time.
*   **Intelligent Learning Mode:** The app's "Learning Mode" uses a spaced repetition system. It tracks the times you get wrong and strategically re-tests you on them to reinforce learning and help you overcome tricky spots.
*   **Clean & Responsive Design:** A minimalist, dark-themed UI that works beautifully on both desktop and mobile devices.

## How to Access

### Live Demo (GitHub Pages)

You can access the live version of this application hosted on GitHub Pages:

**[https://joprojects.github.io/time-teller-tutor/](https://joprojects.github.io/time-teller-tutor/)**

### Running Locally

To run this application on your local machine for testing or development, you need to serve the files from a local web server. This is necessary due to browser security policies (CORS) that prevent modern JavaScript modules from running directly from the local file system (`file://`).

1.  **Clone or download this repository.** 
2.  **Navigate to the `build` directory** in your terminal:
    ```bash
    cd path/to/your/project/build
    ```
3.  **Start a simple web server.** Here are a few common options:
    *   **Using Python 3 (Recommended):**
        ```bash
        python3 -m http.server
        ```
    *   **Using Node.js (if you have it installed):**
        ```bash
        npx serve
        ```
4.  **Open your browser** and go to the URL provided by the server, which is typically `http://localhost:8000`.

## Project Structure

*   **Source Files (`.tsx`):** The development source code is written in React with JSX and can be found in the root and `/components` directories.
*   **Distribution Files (`/build`):** The `/build` folder contains the compiled, browser-ready JavaScript, HTML, and other assets. **This is the folder that should be deployed.**