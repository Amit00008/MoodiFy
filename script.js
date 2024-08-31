const clientId = 'e98815775cab4d2a82a40b51ba1f6536';
const clientSecret = '3df3ab2d25ff4a6e9b688d803e096b24';
let token;


async function getToken() {
    try {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        if (!result.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await result.json();
        token = data.access_token;
    } catch (error) {
        console.error('Error getting token:', error);
    }
}

async function searchPlaylists(query) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!result.ok) {
            throw new Error('Failed to search playlists');
        }

        const data = await result.json();
        return data.playlists.items;
    } catch (error) {
        console.error('Error searching playlists:', error);
        return [];
    }
}

async function generatePlaylist() {
    const mood = document.getElementById('mood').value;
    const genre = document.getElementById('genre').value;
    const playlistDiv = document.getElementById('playlist');

    try {
        // Create the query with mood and genre
        const query = `${mood} ${genre}`;

        // Search for playlists based on the query
        const playlists = await searchPlaylists(query);

        if (playlists.length === 0) {
            playlistDiv.innerHTML = `<p>No playlists available for the selected mood and genre.</p>`;
            return;
        }

        // Shuffle playlists
        playlists.sort(() => Math.random() - 0.5);

        playlistDiv.innerHTML = `<h2>Playlists for ${mood.charAt(0).toUpperCase() + mood.slice(1)} Mood and ${genre.charAt(0).toUpperCase() + genre.slice(1)} Genre:</h2>`;
        playlists.forEach(playlist => {
            playlistDiv.innerHTML += `<p><a href="${playlist.external_urls.spotify}" target="_blank">${playlist.name}</a></p>`;
        });

        if (playlists.length === 0) {
            playlistDiv.innerHTML = `<p>No playlists available for the selected mood and genre.</p>`;
        }
    } catch (error) {
        console.error('Error generating playlist:', error);
        playlistDiv.innerHTML = `<p>An error occurred while generating the playlist.</p>`;
    }
}

async function analyzeText() {
    const text = document.getElementById('textMood').value;
    // Simple sentiment analysis - you could use a library like Sentiment.js here
    const mood = text.includes('happy') ? 'happy' : text.includes('sad') ? 'sad' : 'calm';
    document.getElementById('mood').value = mood;
    generatePlaylist();
}

function randomMood() {
    const moods = ['happy', 'sad', 'energetic', 'calm'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    document.getElementById('mood').value = randomMood;
    generatePlaylist();
}

getToken();