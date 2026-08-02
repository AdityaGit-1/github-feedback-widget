const form = document.getElementById("feedbackForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const status = document.getElementById("status");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    status.textContent = "Submitting feedback...";

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

        form.reset();

    } catch (error) {

        status.textContent = error.message;

    }

});