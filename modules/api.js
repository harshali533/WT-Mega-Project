async function fetchMotivationalQuote() {

    const quoteTextElement = document.getElementById("quote-text");
    const quoteAuthorElement = document.getElementById("quote-author");

    quoteTextElement.textContent = "Loading inspiration...";
    quoteAuthorElement.textContent = "";

    try {

        // Random quote ID between 1 and 1450
        const randomId = Math.floor(Math.random() * 1450) + 1;

        const response = await fetch(
            "https://dummyjson.com/quotes/" + randomId
        );

        const data = await response.json();

        quoteTextElement.textContent = `"${data.quote}"`;
        quoteAuthorElement.textContent = `- ${data.author}`;

    } catch (error) {

        console.error("API error:", error);

        quoteTextElement.textContent =
            "Stay motivated and keep learning.";
        quoteAuthorElement.textContent = "- Life Hub";

    }
}