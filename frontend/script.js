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

        showStatus(data.message, "success");

        form.reset();

    } catch (error) {

        showStatus(error.message, "error");

    } finally {

        setLoadingState(false);

    }
}

form.addEventListener("submit", handleSubmit);