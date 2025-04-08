(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Prevent multiple instances
    if (document.getElementById("messageiumContainer")) return;

    // Get customer configuration
    const config = window.messageiumConfig || {};
    const endpoint = config.endpoint;
    if (!endpoint) {
      console.error("Messageium: No endpoint configured. Please set window.messageiumConfig.endpoint.");
      return;
    }

    // Inject CSS
    const style = document.createElement("style");
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      :root {
        --primary: #6366f1;
        --primary-hover: #4f46e5;
        --primary-light: #eef2ff;
        --white: #ffffff;
        --text-main: #1f2937;
        --text-secondary: #6b7280;
        --border: #e2e8f0;
        --border-hover: #cbd5e1;
        --success: #10b981;
        --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
        --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
        --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      }
      .messageium-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        font-size: 14px;
      }
      .messageium-bubble {
        width: 50px;
        height: 50px;
        background-color: var(--primary);
        border-radius: 50%;
        box-shadow: var(--shadow-lg);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: transform 0.3s ease, background-color 0.3s ease;
        position: relative;
      }
      .messageium-bubble:hover {
        transform: translateY(-5px);
        background-color: var(--primary-hover);
      }
      .messageium-bubble svg {
        width: 20px;
        height: 20px;
        fill: var(--white);
      }
      .messageium-tooltip {
        position: absolute;
        bottom: 60px;
        right: 0;
        background-color: var(--text-main);
        color: var(--white);
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        white-space: nowrap;
      }
      .messageium-tooltip::after {
        content: '';
        position: absolute;
        bottom: -4px;
        right: 20px;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid var(--text-main);
      }
      .messageium-bubble:hover .messageium-tooltip {
        opacity: 1;
        visibility: visible;
      }
      .messageium-window {
        position: absolute;
        bottom: 65px;
        right: 0;
        width: 300px;
        height: 450px;
        background-color: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--border);
        transition: all 0.3s ease;
      }
      .messageium-window.active {
        display: flex;
        animation: slideUp 0.3s forwards;
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .messageium-header {
        background-color: var(--primary);
        color: var(--white);
        padding: 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .messageium-header-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .messageium-logo {
        width: 24px;
        height: 24px;
        background-color: var(--white);
        border-radius: 6px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .messageium-logo svg {
        width: 14px;
        height: 14px;
        fill: var(--primary);
      }
      .messageium-header h3 {
        font-size: 15px;
        font-weight: 600;
      }
      .messageium-status {
        font-size: 11px;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .messageium-status-dot {
        width: 6px;
        height: 6px;
        background-color: #10b981;
        border-radius: 50%;
      }
      .messageium-header .close-btn {
        cursor: pointer;
        opacity: 0.8;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.2s ease;
        background-color: rgba(255, 255, 255, 0.1);
      }
      .messageium-header .close-btn:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.2);
      }
      .messageium-body {
        flex: 1;
        padding: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        position: relative;
        background-color: #f9fafb;
      }
      .messageium-welcome {
        padding: 20px 15px;
        text-align: center;
      }
      .messageium-welcome-image {
        margin: 10px auto 15px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background-color: var(--primary-light);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .messageium-welcome-image svg {
        width: 35px;
        height: 35px;
        fill: var(--primary);
      }
      .messageium-welcome h2 {
        color: var(--text-main);
        font-size: 16px;
        margin-bottom: 6px;
        font-weight: 600;
      }
      .messageium-welcome p {
        color: var(--text-secondary);
        margin-bottom: 15px;
        font-size: 13px;
        line-height: 1.4;
      }
      .messageium-button-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 12px;
      }
      .messageium-button {
        padding: 10px 15px;
        background-color: var(--white);
        color: var(--text-main);
        border: 1px solid var(--border);
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: var(--shadow-sm);
        text-align: left;
      }
      .messageium-button:hover {
        border-color: var(--border-hover);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
      .messageium-button.primary {
        background-color: var(--primary);
        color: var(--white);
        border: none;
      }
      .messageium-button.primary:hover {
        background-color: var(--primary-hover);
      }
      .messageium-button svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      .messageium-button-text {
        display: flex;
        flex-direction: column;
      }
      .messageium-button-label {
        font-weight: 600;
      }
      .messageium-button-description {
        font-size: 11px;
        color: var(--text-secondary);
      }
      .messageium-button.primary .messageium-button-description {
        color: rgba(255, 255, 255, 0.8);
      }
      .messageium-form {
        display: none;
        flex-direction: column;
        gap: 15px;
        padding: 15px;
        height: 100%;
      }
      .messageium-form-header {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      }
      .messageium-back-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: var(--white);
        border: 1px solid var(--border);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        margin-right: 8px;
        flex-shrink: 0;
      }
      .messageium-back-btn:hover {
        background-color: #f9fafb;
        border-color: var(--border-hover);
      }
      .messageium-form-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-main);
      }
      .messageium-form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .messageium-form-group label {
        font-size: 12px;
        color: var(--text-secondary);
        font-weight: 500;
      }
      .messageium-form-control {
        padding: 10px 12px;
        border: 1px solid var(--border);
        border-radius: 6px;
        font-size: 13px;
        transition: all 0.2s ease;
        background-color: var(--white);
      }
      .messageium-form-control:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
      }
      .messageium-form textarea.messageium-form-control {
        height: 120px;
        resize: none;
      }
      .messageium-form-footer {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .messageium-submit-btn {
        padding: 10px;
        background-color: var(--primary);
        color: var(--white);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
      }
      .messageium-submit-btn:hover {
        background-color: var(--primary-hover);
      }
      .messageium-submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .messageium-back-link {
        color: var(--text-secondary);
        text-align: center;
        cursor: pointer;
        font-size: 12px;
      }
      .messageium-back-link:hover {
        color: var(--primary);
      }
      .messageium-success {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 20px 15px;
        height: 100%;
        animation: fadeIn 0.5s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .messageium-success-icon {
        width: 60px;
        height: 60px;
        background-color: #ecfdf5;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 15px;
      }
      .messageium-success-icon svg {
        width: 30px;
        height: 30px;
        fill: var(--success);
      }
      .messageium-success h3 {
        color: var(--text-main);
        font-size: 18px;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .messageium-success p {
        color: var(--text-secondary);
        margin-bottom: 20px;
        max-width: 220px;
        line-height: 1.4;
        font-size: 13px;
      }
      .messageium-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10;
      }
      .messageium-spinner {
        width: 30px;
        height: 30px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .messageium-form-control.error {
        border-color: #ef4444;
      }
      .messageium-error-message {
        color: #ef4444;
        font-size: 11px;
        margin-top: 3px;
        display: none;
      }
      @media (max-width: 480px) {
        .messageium-window {
          width: calc(100vw - 30px);
          max-width: 280px;
          height: 420px;
          right: -5px;
        }
        .messageium-container {
          bottom: 15px;
          right: 15px;
        }
        .messageium-bubble {
          width: 45px;
          height: 45px;
        }
        .messageium-welcome-image {
          width: 60px;
          height: 60px;
        }
        .messageium-welcome h2 {
          font-size: 15px;
        }
      }
      @media (min-width: 1025px) {
        .messageium-window {
          width: 320px;
          height: 480px;
        }
      }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const container = document.createElement("div");
    container.id = "messageiumContainer";
    container.className = "messageium-container";
    container.innerHTML = `
      <div class="messageium-bubble">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M7 9h10M7 12h7" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <div class="messageium-tooltip">Need help?</div>
      </div>
      <div class="messageium-window">
        <div class="messageium-header">
          <div class="messageium-header-content">
            <div class="messageium-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div>
              <h3>Messageium Support</h3>
              <div class="messageium-status">
                <div class="messageium-status-dot"></div>
                <span>Online now</span>
              </div>
            </div>
          </div>
          <div class="close-btn">✕</div>
        </div>
        <div class="messageium-body">
          <div class="messageium-loading">
            <div class="messageium-spinner"></div>
          </div>
          <div class="messageium-welcome">
            <div class="messageium-welcome-image">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                <path d="M7 7h10M7 10h7M7 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <h2>Welcome to Messageium</h2>
            <p>We're here to help. How would you like to get in touch with our support team?</p>
            <div class="messageium-button-container">
              <button class="messageium-button primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                  <path d="M16.5 14c-.53.21-1.12.35-1.5.35-2.5 0-4.5-2-4.5-4.5S12.5 5 15 5c1.25 0 2 .25 3 1"></path>
                </svg>
                <div class="messageium-button-text">
                  <span class="messageium-button-label">Connect with Support</span>
                  <span class="messageium-button-description">Talk to our team directly</span>
                </div>
              </button>
              <button class="messageium-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4M12 16h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"></path>
                </svg>
                <div class="messageium-button-text">
                  <span class="messageium-button-label">Report an Issue</span>
                  <span class="messageium-button-description">Let us know about any problems</span>
                </div>
              </button>
            </div>
          </div>
          <form class="messageium-form messageium-issue-form">
            <div class="messageium-form-header">
              <div class="messageium-back-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
              </div>
              <div class="messageium-form-title">Report an Issue</div>
            </div>
            <div class="messageium-form-group">
              <label for="msgm-name">Full Name</label>
              <input type="text" class="messageium-form-control msgm-name" placeholder="John Doe" required>
              <div class="messageium-error-message msgm-name-error">Please enter your name</div>
            </div>
            <div class="messageium-form-group">
              <label for="msgm-email">Email Address</label>
              <input type="email" class="messageium-form-control msgm-email" placeholder="john@example.com" required>
              <div class="messageium-error-message msgm-email-error">Please enter a valid email</div>
            </div>
            <div class="messageium-form-group">
              <label for="msgm-issue-type">Issue Type</label>
              <select class="messageium-form-control msgm-issue-type" required>
                <option value="" disabled selected>Select an issue type</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Account Problem">Account Problem</option>
                <option value="Billing Question">Billing Question</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
              <div class="messageium-error-message msgm-issue-type-error">Please select an issue type</div>
            </div>
            <div class="messageium-form-group">
              <label for="msgm-issue-description">Describe the Issue</label>
              <textarea class="messageium-form-control msgm-issue-description" placeholder="Please provide as much detail as possible..." required></textarea>
              <div class="messageium-error-message msgm-issue-description-error">Please describe your issue</div>
            </div>
            <div class="messageium-form-footer">
              <button type="submit" class="messageium-submit-btn">Submit Report</button>
              <span class="messageium-back-link">Return to Support Options</span>
            </div>
          </form>
          <form class="messageium-form messageium-support-form">
            <div class="messageium-form-header">
              <div class="messageium-back-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
              </div>
              <div class="messageium-form-title">Connect with Support</div>
            </div>
            <div class="messageium-form-group">
              <label for="msgm-support-name">Full Name</label>
              <input type="text" class="messageium-form-control msgm-support-name" placeholder="John Doe" required>
              <div class="messageium-error-message msgm-support-name-error">Please enter your name</div>
            </div>
            <div class="messageium-form-group">
              <label for="msgm-support-email">Email Address</label>
              <input type="email" class="messageium-form-control msgm-support-email" placeholder="john@example.com" required>
              <div class="messageium-error-message msgm-support-email-error">Please enter a valid email</div>
            </div>
            <div class="messageium-form-group">
              <label for="msgm-support-subject">Subject</label>
              <input type="text" class="messageium-form-control msgm-support-subject" placeholder="How can we help you?" required>
              <div class="messageium-error-message msgm-support-subject-error">Please enter a subject</div>
            </div>
            <div class="messageium-form-group">
              <label for="msgm-support-message">Message</label>
              <textarea class="messageium-form-control msgm-support-message" placeholder="Please describe how we can help you..." required></textarea>
              <div class="messageium-error-message msgm-support-message-error">Please enter your message</div>
            </div>
            <div class="messageium-form-footer">
              <button type="submit" class="messageium-submit-btn">Connect Me</button>
              <span class="messageium-back-link">Return to Support Options</span>
            </div>
          </form>
          <div class="messageium-success">
            <div class="messageium-success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3>Message Sent!</h3>
            <p>Thank you for reaching out. Our support team will get back to you shortly.</p>
            <button class="messageium-button primary">
              <span class="messageium-button-label">Start New Request</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // Select DOM elements
    const bubble = container.querySelector(".messageium-bubble");
    const window = container.querySelector(".messageium-window");
    const closeBtn = container.querySelector(".close-btn");
    const welcome = container.querySelector(".messageium-welcome");
    const customerSupportBtn = welcome.querySelector(".messageium-button.primary");
    const reportIssueBtn = welcome.querySelector(".messageium-button:not(.primary)");
    const issueForm = container.querySelector(".messageium-issue-form");
    const supportForm = container.querySelector(".messageium-support-form");
    const issueBackBtn = issueForm.querySelector(".messageium-back-btn");
    const supportBackBtn = supportForm.querySelector(".messageium-back-btn");
    const issueBackLink = issueForm.querySelector(".messageium-back-link");
    const supportBackLink = supportForm.querySelector(".messageium-back-link");
    const success = container.querySelector(".messageium-success");
    const newRequestBtn = success.querySelector(".messageium-button");
    const loading = container.querySelector(".messageium-loading");

    // Form elements
    const formElements = {
      name: issueForm.querySelector(".msgm-name"),
      email: issueForm.querySelector(".msgm-email"),
      issueType: issueForm.querySelector(".msgm-issue-type"),
      issueDescription: issueForm.querySelector(".msgm-issue-description"),
      supportName: supportForm.querySelector(".msgm-support-name"),
      supportEmail: supportForm.querySelector(".msgm-support-email"),
      supportSubject: supportForm.querySelector(".msgm-support-subject"),
      supportMessage: supportForm.querySelector(".msgm-support-message"),
    };

    // Error elements
    const errorElements = {
      nameError: issueForm.querySelector(".msgm-name-error"),
      emailError: issueForm.querySelector(".msgm-email-error"),
      issueTypeError: issueForm.querySelector(".msgm-issue-type-error"),
      issueDescriptionError: issueForm.querySelector(".msgm-issue-description-error"),
      supportNameError: supportForm.querySelector(".msgm-support-name-error"),
      supportEmailError: supportForm.querySelector(".msgm-support-email-error"),
      supportSubjectError: supportForm.querySelector(".msgm-support-subject-error"),
      supportMessageError: supportForm.querySelector(".msgm-support-message-error"),
    };

    // Event listeners
    bubble.addEventListener("click", function () {
      if (window.classList.contains("active")) {
        window.classList.remove("active");
        setTimeout(() => (window.style.display = "none"), 300);
      } else {
        window.style.display = "flex";
        setTimeout(() => window.classList.add("active"), 10);
      }
    });

    closeBtn.addEventListener("click", function () {
      window.classList.remove("active");
      setTimeout(() => (window.style.display = "none"), 300);
    });

    reportIssueBtn.addEventListener("click", function () {
      fadeOut(welcome);
      setTimeout(() => {
        welcome.style.display = "none";
        issueForm.style.display = "flex";
        fadeIn(issueForm);
      }, 300);
    });

    customerSupportBtn.addEventListener("click", function () {
      fadeOut(welcome);
      setTimeout(() => {
        welcome.style.display = "none";
        supportForm.style.display = "flex";
        fadeIn(supportForm);
      }, 300);
    });

    issueBackBtn.addEventListener("click", showWelcomeScreen);
    supportBackBtn.addEventListener("click", showWelcomeScreen);
    issueBackLink.addEventListener("click", showWelcomeScreen);
    supportBackLink.addEventListener("click", showWelcomeScreen);
    newRequestBtn.addEventListener("click", showWelcomeScreen);

    issueForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validateForm("issue")) submitForm("issue");
    });

    supportForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validateForm("support")) submitForm("support");
    });

    // Helper functions
    function showWelcomeScreen() {
      fadeOut(issueForm);
      fadeOut(supportForm);
      fadeOut(success);
      setTimeout(() => {
        issueForm.style.display = "none";
        supportForm.style.display = "none";
        success.style.display = "none";
        welcome.style.display = "block";
        fadeIn(welcome);
      }, 300);
    }

    function validateForm(formType) {
      let isValid = true;
      if (formType === "issue") {
        if (!formElements.name.value.trim()) {
          showError(formElements.name, errorElements.nameError);
          isValid = false;
        } else {
          hideError(formElements.name, errorElements.nameError);
        }
        if (!validateEmail(formElements.email.value)) {
          showError(formElements.email, errorElements.emailError);
          isValid = false;
        } else {
          hideError(formElements.email, errorElements.emailError);
        }
        if (!formElements.issueType.value) {
          showError(formElements.issueType, errorElements.issueTypeError);
          isValid = false;
        } else {
          hideError(formElements.issueType, errorElements.issueTypeError);
        }
        if (!formElements.issueDescription.value.trim()) {
          showError(formElements.issueDescription, errorElements.issueDescriptionError);
          isValid = false;
        } else {
          hideError(formElements.issueDescription, errorElements.issueDescriptionError);
        }
      } else if (formType === "support") {
        if (!formElements.supportName.value.trim()) {
          showError(formElements.supportName, errorElements.supportNameError);
          isValid = false;
        } else {
          hideError(formElements.supportName, errorElements.supportNameError);
        }
        if (!validateEmail(formElements.supportEmail.value)) {
          showError(formElements.supportEmail, errorElements.supportEmailError);
          isValid = false;
        } else {
          hideError(formElements.supportEmail, errorElements.supportEmailError);
        }
        if (!formElements.supportSubject.value.trim()) {
          showError(formElements.supportSubject, errorElements.supportSubjectError);
          isValid = false;
        } else {
          hideError(formElements.supportSubject, errorElements.supportSubjectError);
        }
        if (!formElements.supportMessage.value.trim()) {
          showError(formElements.supportMessage, errorElements.supportMessageError);
          isValid = false;
        } else {
          hideError(formElements.supportMessage, errorElements.supportMessageError);
        }
      }
      return isValid;
    }

    function validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    function showError(input, errorElement) {
      input.classList.add("error");
      errorElement.style.display = "block";
    }

    function hideError(input, errorElement) {
      input.classList.remove("error");
      errorElement.style.display = "none";
    }

    function submitForm(formType) {
      loading.style.display = "flex";
      const form = formType === "issue" ? issueForm : supportForm;
      const formData = new FormData(form);
      formData.append("form_type", formType);
      formData.append("page_url", window.location.href);

      fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: config.headers || {},
      })
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((data) => {
          console.log("Success:", data);
          form.reset();
          fadeOut(form);
          setTimeout(() => {
            form.style.display = "none";
            success.style.display = "flex";
            fadeIn(success);
          }, 300);
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("There was a problem submitting your form. Please try again.");
        })
        .finally(() => (loading.style.display = "none"));
    }

    function fadeIn(element) {
      element.style.opacity = "0";
      setTimeout(() => {
        element.style.transition = "opacity 0.3s ease";
        element.style.opacity = "1";
      }, 10);
    }

    function fadeOut(element) {
      element.style.transition = "opacity 0.3s ease";
      element.style.opacity = "0";
    }
  });
})();