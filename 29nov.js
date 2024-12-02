const BASE_URL = "https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest";  // Replace YOUR_API_KEY with your API key

const countryList = {
    USD: "United States",
    EUR: "Europe",
    INR: "India",
    AUD: "Australia"
};

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("#convert-btn");
const msg = document.querySelector(".msg");

// Populate dropdowns with currencies
for (let select of dropdowns) {
    for (let currCode in countryList) {
        let newOption = document.createElement("option");
        newOption.textContent = currCode;
        newOption.value = currCode;
        select.appendChild(newOption);

        // Set default selections
        if (select.name === "from" && currCode === "USD") {
            newOption.selected = true;
        } else if (select.name === "to" && currCode === "INR") {
            newOption.selected = true;
        }
    }

    // Attach change event listener to update flags
    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);
    });
}

// Function to update the flag based on the selected currency
const updateFlag = (element) => {
    let currCode = element.value; // Get selected currency code
    let countryName = countryList[currCode]; // Get country name

    // Map country names to country codes for the Flags API
    const countryCodes = {
        "United States": "US",
        "Europe": "EU",
        "India": "IN",
        "Australia": "AU"
    };

    let countryCode = countryCodes[countryName];
    let newSrc;

    // Handle special case for EUR (Europe)
    if (currCode === "EUR") {
        newSrc = "https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg";
    } else if (countryCode) {
        newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    } else {
        console.error(`No flag found for ${currCode}`);
        return;
    }

    // Update the <img> source
    let img = element.parentElement.querySelector("img");
    if (img) {
        img.src = newSrc;
    } else {
        console.error("No <img> element found to update the flag");
    }
};

// Function to update the exchange rate
const updateExchangeRate = async () => {
    let fromCurr = document.querySelector(".from select").value;
    let toCurr = document.querySelector(".to select").value;
    let amount = document.querySelector(".amount input");
    let amtVal = parseFloat(amount.value);

    // Validate the amount input
    if (isNaN(amtVal) || amtVal < 1) {
        amtVal = 1;
        amount.value = "1";
    }

    // Construct the dynamic API URL
    const URL = `${BASE_URL}/${fromCurr.toLowerCase()}`;
    try {
        console.log(`Fetching from URL: ${URL}`); // Log the URL being fetched
        let response = await fetch(URL);
        if (!response.ok) throw new Error(`Failed to fetch exchange rate. Status: ${response.status}`);

        let data = await response.json();
        console.log(data); // Log the data to inspect the response

        // Access rates from the API response
        let rate = data.conversion_rates[toCurr];
        if (!rate) throw new Error("Rate not available for selected currencies");

        let finalAmount = amtVal * rate;
        msg.innerText = `${amtVal} ${fromCurr} = ${finalAmount.toFixed(2)} ${toCurr}`;
    } catch (error) {
        console.error(error);
        msg.innerText = `Error fetching exchange rate: ${error.message}`;
    }
};

// Button click event listener
btn.addEventListener("click", (evt) => {
    evt.preventDefault(); // Prevent form submission
    updateExchangeRate();
});
