const form = document.getElementById("feedbackForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const status = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;

    if (isLoading) {
        submitBtn.textContent = "Submitting...";
    } else {
        submitBtn.textContent = "Submit Feedback";
    }
}

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    setLoadingState(true);

    try {

        const response = await fetch("http://localhost:3000/feedback", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                name,
                message,
            }),

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        status.textContent = data.message;
        status.className = "success";

        form.reset();

    } catch (error) {

        status.textContent = error.message;
        status.className = "error";

    }
    finally{

    setLoadingState(false);

    }

});