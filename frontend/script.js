// Config
// For local development this points at the local backend.
// When deploying (see README → Deployment), update this to your deployed backend URL.
const API_BASE_URL = "http://localhost:3000";

// DOM elements
const form = document.getElementById("feedbackForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const status = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
const charCount = document.getElementById("charCount");
const githubUsername = document.getElementById("githubUsername");
const fetchProfileBtn = document.getElementById("fetchProfileBtn");
const githubProfile = document.getElementById("githubProfile");
const recentSearches = document.getElementById("recentSearches");
const themeToggleBtn = document.getElementById("themeToggleBtn");

//Theme (dark mode), persisted in localStorage
const THEME_STORAGE_KEY = "theme";

//Apply a theme by setting the data attribute the CSS variables key off
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

//Load the saved theme, falling back to the OS preference, and apply it
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    const theme = savedTheme || (
        window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
    );

    applyTheme(theme);
}

//Toggle between light and dark, persisting the choice
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
}

//UI helper 
function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    nameInput.disabled = isLoading;
    messageInput.disabled = isLoading;

    if (isLoading) {
        submitBtn.innerHTML = `<span class="spinner"></span> Submitting...`;
    } else {
        submitBtn.textContent = "Submit Feedback";
    }
}

//API call to submit feedback
async function submitFeedback(name, message) {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, message }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}

//Timer handle for auto-hiding the success card
let statusHideTimeout = null;

//Shared card builder so success/error markup stays DRY
function renderStatusCard(type, innerHtml) {

    clearStatusTimeout();

    status.innerHTML = `
        <div class="status-card ${type}">
            ${innerHtml}
        </div>
    `;
}

//Success card, optionally including the created GitHub issue link
function showSuccessStatus(message, issue) {

    const issueDetails = issue
        ? `
            <p class="status-detail">Issue #${issue.issueNumber} created successfully.</p>
            <a
                href="${issue.issueUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="status-link"
            >
                View on GitHub
            </a>
        `
        : "";

    renderStatusCard(
        "success",
        `<p class="status-message">${message}</p>${issueDetails}`
    );

    statusHideTimeout = setTimeout(clearStatus, 5000);
}

//Error card
function showErrorStatus(message) {
    renderStatusCard("error", `<p class="status-message">${message}</p>`);
}

function clearStatusTimeout() {
    if (statusHideTimeout) {
        clearTimeout(statusHideTimeout);
        statusHideTimeout = null;
    }
}

//Guard clause to validate inputs
function validateInputs(name, message) {

    if (!name) {
        showErrorStatus("Name is required.");
        return false;
    }

    if (name.length > 50) {
        showErrorStatus("Name cannot exceed 50 characters.");
        return false;
    }

    if (!message) {
        showErrorStatus("Feedback is required.");
        return false;
    }

    if (message.length > 500) {
        showErrorStatus("Feedback cannot exceed 500 characters.");
        return false;
    }

    return true;
}

//Character count update 
function updateCharacterCount() {
    charCount.textContent = `${messageInput.value.length} / 500`;
}

//Clear status message when user starts typing
function clearStatus() {
    clearStatusTimeout();
    status.innerHTML = "";
}

//Clear GitHub profile 
function clearGithubProfile() {
    githubProfile.innerHTML = "";
}

//Recent GitHub username searches, persisted in localStorage
const RECENT_SEARCHES_KEY = "recentGithubSearches";
const MAX_RECENT_SEARCHES = 5;

//Read recent searches from localStorage
function getRecentSearches() {
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
}

//Save a username to the front of recent searches, de-duplicated and capped
function saveRecentSearch(username) {
    const existing = getRecentSearches().filter(
        (entry) => entry.toLowerCase() !== username.toLowerCase()
    );

    const updated = [username, ...existing].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));

    renderRecentSearches();
}

//Render recent searches as clickable chips
function renderRecentSearches() {
    const searches = getRecentSearches();

    if (searches.length === 0) {
        recentSearches.innerHTML = "";
        return;
    }

    let chipsHtml = "";

    for (const username of searches) {
        chipsHtml += `
            <button
                type="button"
                class="recent-search-chip"
                data-username="${username}"
            >
                ${username}
            </button>
        `;
    }

    recentSearches.innerHTML = `
        <p class="recent-searches-label">Recent Searches</p>
        <div class="recent-search-chips">${chipsHtml}</div>
    `;
}

//Event handler for clicking a recent search chip
function handleRecentSearchClick(event) {
    const chip = event.target.closest(".recent-search-chip");

    if (!chip) {
        return;
    }

    githubUsername.value = chip.dataset.username;

    handleFetchProfile();
}

//Event handler 
async function handleSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!validateInputs(name, message)) {
        return;
    }

    setLoadingState(true);

    try {
        const data = await submitFeedback(name, message);

        showSuccessStatus(data.message, {
            issueNumber: data.issueNumber,
            issueUrl: data.issueUrl,
        });

        form.reset();

        updateCharacterCount();

    } catch (error) {

        showErrorStatus(error.message);

    } finally {

        setLoadingState(false);

    }
}

//Fetch Github profile
async function fetchGithubProfile(username) {

    const response = await fetch(
        `https://api.github.com/users/${username}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}

//Event handler for fetching
async function handleFetchProfile() {

    const username = githubUsername.value.trim();

    if (!username) {

        githubProfile.innerHTML = `
            <p class="error">
                Please enter a GitHub username.
            </p>
    `;

        return;
    }

    clearGithubProfile();

    fetchProfileBtn.disabled = true;
    fetchProfileBtn.textContent = "Loading...";

    try {

        const profile = await fetchGithubProfile(username);

        renderGithubProfile(profile);

        saveRecentSearch(username);

    } catch (error) {

        githubProfile.innerHTML = `
            <p class="error">
                ${error.message}
            </p>
        `;

    } finally {

        fetchProfileBtn.disabled = false;
        fetchProfileBtn.textContent = "Fetch Profile";

    }

}

//Format an ISO date string as a readable "Month Year"
function formatJoinedDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
    });
}

//Build one optional profile detail row, skipping it when there's no value (DRY, avoids a guard per field)
function buildProfileDetailRow(label, value, isLink) {
    if (!value) {
        return "";
    }

    const content = isLink
        ? `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`
        : value;

    return `<p class="profile-detail"><strong>${label}:</strong> ${content}</p>`;
}

//Render Github profile
function renderGithubProfile(profile) {

    const bioHtml = profile.bio
        ? `<p class="profile-bio">${profile.bio}</p>`
        : "";

    const detailsHtml = [
        buildProfileDetailRow("Company", profile.company),
        buildProfileDetailRow("Location", profile.location),
        buildProfileDetailRow("Blog", profile.blog, true),
        buildProfileDetailRow(
            "Joined",
            profile.created_at ? formatJoinedDate(profile.created_at) : null
        ),
    ].join("");

    githubProfile.innerHTML = `
        <div class="profile-card">

            <img
                src="${profile.avatar_url}"
                alt="${profile.login}'s Avatar"
                class="profile-avatar"
            >

            <h3>${profile.name || profile.login}</h3>

            <p class="username">@${profile.login}</p>

            ${bioHtml}

            <div class="profile-stats">

                <p><strong>Followers:</strong> ${profile.followers}</p>

                <p><strong>Following:</strong> ${profile.following}</p>

                <p><strong>Repositories:</strong> ${profile.public_repos}</p>

            </div>

            <div class="profile-details">
                ${detailsHtml}
            </div>

            <a
                href="${profile.html_url}"
                target="_blank"
                rel="noopener noreferrer"
            >
                View GitHub Profile
            </a>

        </div>
    `;
}

form.addEventListener("submit", handleSubmit);

nameInput.addEventListener("input", clearStatus);

messageInput.addEventListener("input", clearStatus);

messageInput.addEventListener("input", updateCharacterCount);

fetchProfileBtn.addEventListener("click", handleFetchProfile);

githubUsername.addEventListener("input", clearGithubProfile);

recentSearches.addEventListener("click", handleRecentSearchClick);

themeToggleBtn.addEventListener("click", toggleTheme);

initTheme();

renderRecentSearches();