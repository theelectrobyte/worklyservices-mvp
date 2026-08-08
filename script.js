const serviceForm = document.getElementById('service-request-form');
const statusMessage = document.getElementById('form-status');

const langToggleBtn = document.getElementById('lang-toggle');
const langToggleBtnSmall = document.getElementById('lang-toggle-small');
const toggleLang = document.querySelectorAll("#lang-toggle, #lang-toggle-small");
const translatableElements = document.querySelectorAll('[data-en]');

// Track current language state
let savedLang = localStorage.getItem("userLanguage");

document.addEventListener("DOMContentLoaded", () => {

    if (!savedLang) {
        document.getElementById("langPopup").style.display = "flex";
    } else {
        toggleLanguage();
    }
});

function setLanguage(lang) {
    // 1. Save preference locally on the user's phone/browser
    localStorage.setItem("userLanguage", lang);
    savedLang = lang;
    toggleLanguage(); // Apply the selected language immediately
    document.getElementById("langPopup").style.display = "none";

}

function translateInterface(lang) {
    translatableElements.forEach(el => {
        const targetText = el.getAttribute(`data-${lang}`);

        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            el.placeholder = targetText;
        } else {
            el.textContent = targetText;
        }
    });
}

function toggleLanguage() {
    if (savedLang === 'en') {
        translateInterface('ml');
        document.body.classList.add('lang-ml');
        langToggleBtnSmall.textContent = 'En';
        langToggleBtn.textContent = 'English';
        localStorage.setItem("userLanguage", 'en');
        savedLang = 'ml';
    } else {
        translateInterface('en');
        document.body.classList.remove('lang-ml');
        langToggleBtnSmall.textContent = 'മ';
        langToggleBtn.textContent = 'മലയാളം';
        localStorage.setItem("userLanguage", 'ml');
        savedLang = 'en';
    }
}

toggleLang.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleLanguage();
    });
});

if (serviceForm) {
    serviceForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const loader = document.getElementById('loadingOverlay');
        const button = document.getElementById('submitBtn');

        const fullName = document.getElementById('full-name').value.trim();
        const phoneNumber = document.getElementById('phone-number').value.trim();
        const serviceType = document.getElementById('service-type').value.trim();
        const serviceLocation = document.getElementById('service-location').value.trim();
        const streetAddress = document.getElementById('street-address').value.trim();
        const landmark = document.getElementById('landmark').value.trim();
        const issueDetails = document.getElementById('issue-details').value.trim();

        const turnstileToken =
            document.querySelector(
                '[name="cf-turnstile-response"]'
            ).value;

        if (!fullName || !phoneNumber || !serviceType || !serviceLocation || !streetAddress) {
            statusMessage.textContent = 'Please fill in the required fields so we can help you faster.';
            statusMessage.className = 'form-status error';
            return;
        }

        const data = {
            name: fullName,
            phone: phoneNumber,
            service: serviceType,
            location: serviceLocation,
            address: streetAddress,
            landmark: landmark,
            details: issueDetails,

            turnstileToken
        };

        loader.classList.add('active');
        button.disabled = true;

        try {
            const response = await fetch("https://super-dust-b6ef.thesolodevelopers.workers.dev/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit the request.");
            }

            statusMessage.textContent = `Thanks, ${fullName}! We will contact you shortly about your ${serviceType.toLowerCase()} request.`;
            statusMessage.className = 'form-status success';

            loader.classList.remove('active');
            button.disabled = false;

            serviceForm.reset();
            turnstile.reset("#captcha");
            alert(`Thank you, ${fullName}! Your request has been submitted.`);

        } catch (error) {
            console.error(error);

            loader.classList.remove('active');
            button.disabled = false;

            statusMessage.textContent = "Unable to submit your request. Error: " + (error.message || "An unexpected error occurred.");
            statusMessage.className = "form-status error";

            turnstile.reset("#captcha");
            alert(error.message || "An error occurred while submitting your request. Please try again.");
        }
    });
}
