document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list with delete icons
        const participantsList = details.participants.map(
          (participant) => `
            <div class="participant-item">
              <span>${participant}</span>
              <button class="delete-participant" data-activity="${name}" data-email="${participant}">❌</button>
            </div>
          `
        ).join("");

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants:</h5>
            <div>${participantsList}</div>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${activity}/signup?email=${email}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        messageDiv.textContent = "Successfully signed up!";
        messageDiv.className = "success";

        // Refresh activities list dynamically
        fetchActivities();
      } else {
        const errorData = await response.json();
        messageDiv.textContent = errorData.detail || "Failed to sign up.";
        messageDiv.className = "error";
      }
    } catch (error) {
      messageDiv.textContent = "An error occurred. Please try again later.";
      messageDiv.className = "error";
      console.error("Error signing up:", error);
    }

    messageDiv.classList.remove("hidden");

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  });

  // Add event listener for delete buttons
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-participant")) {
      const activity = event.target.dataset.activity;
      const email = event.target.dataset.email;

      try {
        const response = await fetch(`/activities/${activity}/unregister?email=${email}`, {
          method: "POST",
        });

        if (response.ok) {
          fetchActivities(); // Refresh activities list
        } else {
          console.error("Failed to unregister participant:", await response.text());
        }
      } catch (error) {
        console.error("Error unregistering participant:", error);
      }
    }
  });

  // Initialize app
  fetchActivities();
});
