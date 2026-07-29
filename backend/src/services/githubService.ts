import axios from "axios";

export const createGitHubIssue = async (
    name: string,
    message: string
) => {
    const response = await axios.post(
        "https://api.github.com/repos/AdityaGit-1/github-feedback-widget/issues",
        {
            title: `Feedback from ${name}`,
            body: message,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github+json",
            },
        }
    );

    return response.data;
};