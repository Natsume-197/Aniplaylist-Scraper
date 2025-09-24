# Aniplaylist-Scraper

A small script for mass extracting music data from AniPlaylist.

## Description

This project collects as many song records ("hits") as possible, organized by season. At the moment this script It is designed to:

- Extract structured data in JSON format.
- Handle large volumes of records (>1000 hits per category) and their limitations with Algolia.
- Automatically avoid duplicates.

The script is intended for personal or educational use only. Avoid mass usage that could affect the public Algolia API. 

## Project Structure

After running the script, the output will be saved in the `./output` folder:

output/
├── 2017.json
├── 2018.json
├── Winter_2021.json
├── Fall_2023.json
└── ... (one file per season)

Each JSON file contains an array of song records with fields such as:

- `objectID` – unique identifier for the song.
- `title` – song title.
- `artist` – performing artist(s).
- `season` – the season/year of the song.
- `song_type` – type of song (Opening, Ending, OST, etc.).
- …and other metadata returned by the API.

## Usage

1. Clone the repository:

```bash
git clone https://github.com/Natsume-197/Aniplaylist-Scraper.git
cd Aniplaylist-Scraper
```

2. Install dependencies:

```bash
npm install
```

3. Please refer to the `.env.example` file. Then, create a `.env` file in the root of the project with the required variables.

4. Run the script:

```bash
node index.js
```