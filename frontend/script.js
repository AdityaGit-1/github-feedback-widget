// DOM elements
const form = document.getElementById("feedbackForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const status = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

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

//Event handler 
async function handleSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    setLoadingState(true);

    try {
        const data = await submitFeedback(name, message);

        showStatus(data.message, "success");

        form.reset();

    } catch (error) {

        showStatus(error.message, "error");

    } finally {

        setLoadingState(false);

    }
}

form.addEventListener("submit", handleSubmit);