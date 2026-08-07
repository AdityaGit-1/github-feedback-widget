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
const feedbackList = document.getElementById("feedbackList");

//UI helper 
function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;

    if (isLoading) {
        submitBtn.textContent = "Submitting...";
    } else {
        submitBtn.textContent = "Submit Feedback";
    }
}

//API call to submit feedback
async function submitFeedback(name, message) {
    const response = await fetch("http://localhost:3000/feedback", {
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
    status.textContent = "";
    status.className = "";
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

//Render Github profile
function renderGithubProfile(profile) {

    githubProfile.innerHTML = `
        <div class="profile-card">

            <img
                src="${profile.avatar_url}"
                alt="${profile.login}'s Avatar"
                class="profile-avatar"
            >

            <h3>${profile.name || profile.login}</h3>

            <p class="username">@${profile.login}</p>

            <div class="profile-stats">

                <p><strong>Followers:</strong> ${profile.followers}</p>

                <p><strong>Following:</strong> ${profile.following}</p>

                <p><strong>Repositories:</strong> ${profile.public_repos}</p>

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
