// Load chat history from local storage when the page loads
window.onload = function() {
    const userChat = localStorage.getItem("userChat");
    const openaiResponse = localStorage.getItem("openaiResponse");
    if (userChat && openaiResponse) {
        document.getElementById("user-chat").textContent = userChat;
        document.getElementById("openai-response").textContent = openaiResponse;
    }
};


async function sendChatMessage() {
    const userMessage = document.querySelector(".textbox").value;
    console.log(userMessage);


    // Load existing chat history from local storage
    let userChatHistory = localStorage.getItem("userChatHistory");
    userChatHistory = userChatHistory ? JSON.parse(userChatHistory) : [];

    // Append the new user message to the chat history
    userChatHistory.push({ role: "user", content: `User: ${userMessage}` });

    // Save the updated chat history back to local storage
    localStorage.setItem("userChatHistory", JSON.stringify(userChatHistory));

    document.querySelector(".textbox").value = "";

    // Display the user message in the chat container
    appendMessage(`User:${userMessage}`, "user");

    const openaiApiKey = "YOUR_OPENAI_API_KEY_HERE"; // Replace "YOUR_API_KEY" with your actual API key

    const prompts = {
        regular: "I am a language model created and fine-tuned by OpenAI.",
        creator: "I am originally created by OpenAI and Hakucha AI fine-tuned by Sujan Maharjan."
    };

    const prompt = userMessage.includes("who created you") || userMessage.includes("who made you") || userMessage.includes("who are you")?
        prompts.creator :
        prompts.regular;

    const requestBody = {
        // messages: [{ role: "system", content: `${userMessage}` }],
        messages: [{ role: "system", content: prompt }, { role: "system", content: `${userMessage}` }],
        model: "gpt-3.5-turbo-1106", // Specify the model you want to use
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openaiApiKey}`,
                "Stream": "true"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const openaiResponse = responseData.choices[0].message.content;
        console.log(openaiResponse);

        // Append the OpenAI response to the chat history
        userChatHistory.push({ role: "system", content: `Hakucha: ${openaiResponse}` });

        // Save the updated chat history back to local storage
        localStorage.setItem("userChatHistory", JSON.stringify(userChatHistory));

        // Display the OpenAI response in the chat container
        appendMessage(`Hakucha: ${openaiResponse}`, "system");
    } catch (error) {
        console.error("Error:", error);
    }
}
document.getElementById("textbox").addEventListener("keypress", function(event) {
            // Check if the pressed key is "Enter" (key code 13)
            if (event.key === "Enter") {
                // Prevent the default behavior of "Enter" key (e.g., adding a newline)
                event.preventDefault();

                // Call the function to send the chat message
                sendChatMessage();
            }
        });

function appendMessage(message, role) {
    const chatContainer = document.querySelector(".chat");
    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = message;
    messageParagraph.classList.add(role);
    chatContainer.appendChild(messageParagraph);
}
