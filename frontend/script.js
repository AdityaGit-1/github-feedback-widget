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

// Function to show status messages
function showStatus(message, type) {

    status.textContent = message;
    status.className = type;

}

//Guard clause to validate inputs
function validateInputs(name, message) {

    if (!name) {
        showStatus("Name is required.", "error");
        return false;
    }

    if (name.length > 50) {
        showStatus("Name cannot exceed 50 characters.", "error");
        return false;
    }

    if (!message) {
        showStatus("Feedback is required.", "error");
        return false;
    }

    if (message.length > 500) {
        showStatus("Feedback cannot exceed 500 characters.", "error");
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

        const feedbacks = await fetchFeedbacks();

        renderFeedbackList(feedbacks);

        showStatus(data.message, "success");

        form.reset();

        updateCharacterCount();

    } catch (error) {

        showStatus(error.message, "error");

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

//Fetch feedbacks 
async function fetchFeedbacks() {
    const response = await fetch("http://localhost:3000/feedback");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;

}

//Initialize feedbacks on page load
async function initializeFeedbacks() {

    try {

        const feedbacks = await fetchFeedbacks();

        renderFeedbackList(feedbacks);

    } catch (error) {

        console.error(error);

    }

}

//Feedback list render 
function renderFeedbackList(feedbacks) {

    if (feedbacks.length === 0) {

        feedbackList.innerHTML = `
            <p>No feedback available yet.</p>
        `;

        return;
    }

    let html = "";

    for (const feedback of feedbacks) {

        html += `
            <div class="feedback-item">

                <h4>${feedback.name}</h4>

                <p>${feedback.message}</p>

            </div>
        `;
    }

    feedbackList.innerHTML = html;

}

form.addEventListener("submit", handleSubmit);

nameInput.addEventListener("input", clearStatus);

messageInput.addEventListener("input", clearStatus);

messageInput.addEventListener("input", updateCharacterCount);

fetchProfileBtn.addEventListener("click", handleFetchProfile);

githubUsername.addEventListener("input", clearGithubProfile);

initializeFeedbacks();