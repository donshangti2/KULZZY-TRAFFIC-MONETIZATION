// ======================================================
// KULZZY TRAFFIC MONETIZATION V1
// ADMIN JAVASCRIPT
// ======================================================

const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");

const campaignForm = document.getElementById("campaignForm");
const campaignMessage = document.getElementById("campaignMessage");

const bannerFile = document.getElementById("bannerFile");
const imagePreview = document.getElementById("imagePreview");


// ======================================================
// LOGIN STATE
// ======================================================

auth.onAuthStateChanged(function(user) {

  if (user) {

    loginSection.classList.add("hidden");
    adminSection.classList.remove("hidden");

    loadCampaigns();

  } else {

    loginSection.classList.remove("hidden");
    adminSection.classList.add("hidden");

  }

});


// ======================================================
// LOGIN
// ======================================================

loginBtn.addEventListener("click", async function() {

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {

    loginMessage.textContent = "Please enter email and password.";
    loginMessage.className = "message error";

    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "LOGGING IN...";

  try {

    await auth.signInWithEmailAndPassword(
      email,
      password
    );

    loginMessage.textContent = "";

  } catch (error) {

    console.error(error);

    loginMessage.textContent =
      "Login failed: " + getFriendlyError(error);

    loginMessage.className = "message error";

  }

  loginBtn.disabled = false;
  loginBtn.textContent = "LOGIN";

});


// ======================================================
// LOGOUT
// ======================================================

logoutBtn.addEventListener("click", async function() {

  await auth.signOut();

});


// ======================================================
// IMAGE PREVIEW
// ======================================================

bannerFile.addEventListener("change", function() {

  const file = bannerFile.files[0];

  if (!file) {

    imagePreview.innerHTML = "";
    return;

  }

  if (!file.type.startsWith("image/")) {

    imagePreview.innerHTML =
      "<p class='error-text'>Please select an image.</p>";

    bannerFile.value = "";

    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {

    imagePreview.innerHTML =
      `<img src="${e.target.result}" alt="Banner Preview">`;

  };

  reader.readAsDataURL(file);

});


// ======================================================
// CREATE CAMPAIGN
// ======================================================

campaignForm.addEventListener("submit", async function(e) {

  e.preventDefault();

  const user = auth.currentUser;

  if (!user) {

    campaignMessage.textContent =
      "You must be logged in.";

    campaignMessage.className =
      "message error";

    return;
  }


  const businessName =
    document.getElementById("businessName").value.trim();

  const amountPaid =
    Number(document.getElementById("amountPaid").value);

  const destinationUrl =
    document.getElementById("destinationUrl").value.trim();

  const startDate =
    document.getElementById("startDate").value;

  const endDate =
    document.getElementById("endDate").value;

  const file =
    bannerFile.files[0];


  if (!file) {

    showCampaignMessage(
      "Please select a banner image.",
      true
    );

    return;
  }


  if (amountPaid < 0) {

    showCampaignMessage(
      "Invalid payment amount.",
      true
    );

    return;
  }


  if (new Date(endDate) <= new Date(startDate)) {

    showCampaignMessage(
      "Campaign end date must be after start date.",
      true
    );

    return;
  }


  if (
    !destinationUrl.startsWith("http://") &&
    !destinationUrl.startsWith("https://")
  ) {

    showCampaignMessage(
      "Destination URL must start with http:// or https://",
      true
    );

    return;
  }


  const submitButton =
    campaignForm.querySelector("button[type='submit']");

  submitButton.disabled = true;
  submitButton.textContent = "UPLOADING...";


  try {

    const campaignId =
      database.ref("campaigns").push().key;


    // -----------------------------------------------
    // UPLOAD IMAGE
    // -----------------------------------------------

    const storagePath =
      `campaign-banners/${campaignId}/${Date.now()}_${file.name}`;

    const storageRef =
      storage.ref(storagePath);

    await storageRef.put(file);

    const bannerUrl =
      await storageRef.getDownloadURL();


    // -----------------------------------------------
    // SAVE CAMPAIGN
    // -----------------------------------------------

    const campaign = {

      id: campaignId,

      businessName: businessName,

      amountPaid: amountPaid,

      destinationUrl: destinationUrl,

      bannerUrl: bannerUrl,

      storagePath: storagePath,

      startDate: new Date(startDate).toISOString(),

      endDate: new Date(endDate).toISOString(),

      status: "active",

      impressions: 0,

      clicks: 0,

      createdAt:
        firebase.database.ServerValue.TIMESTAMP,

      createdBy:
        user.uid

    };


    await database
      .ref("campaigns/" + campaignId)
      .set(campaign);


    campaignForm.reset();

    imagePreview.innerHTML = "";

    showCampaignMessage(
      "Campaign created successfully!",
      false
    );


  } catch (error) {

    console.error(error);

    showCampaignMessage(
      "Could not create campaign: " +
      getFriendlyError(error),
      true
    );

  }


  submitButton.disabled = false;
  submitButton.textContent = "CREATE CAMPAIGN";

});


// ======================================================
// LOAD CAMPAIGNS
// ======================================================

function loadCampaigns() {

  database
    .ref("campaigns")
    .on("value", function(snapshot) {

      const campaigns = [];

      snapshot.forEach(function(child) {

        campaigns.push({
          key: child.key,
          ...child.val()
        });

      });


      campaigns.reverse();

      updateDashboard(campaigns);

      renderCampaigns(campaigns);

    }, function(error) {

      console.error(error);

      document.getElementById("campaignList").innerHTML =
        `<div class="empty-state error-text">
          Unable to load campaigns.
        </div>`;

    });

}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard(campaigns) {

  let totalImpressions = 0;
  let totalClicks = 0;
  let totalRevenue = 0;
  let activeCampaigns = 0;


  campaigns.forEach(function(campaign) {

    totalImpressions +=
      Number(campaign.impressions || 0);

    totalClicks +=
      Number(campaign.clicks || 0);

    totalRevenue +=
      Number(campaign.amountPaid || 0);


    if (isCampaignActive(campaign)) {

      activeCampaigns++;

    }

  });


  document.getElementById("totalCampaigns")
    .textContent = campaigns.length;

  document.getElementById("activeCampaigns")
    .textContent = activeCampaigns;

  document.getElementById("totalImpressions")
    .textContent = formatNumber(totalImpressions);

  document.getElementById("totalClicks")
    .textContent = formatNumber(totalClicks);

  document.getElementById("totalRevenue")
    .textContent = formatMoney(totalRevenue);

}


// ======================================================
// RENDER CAMPAIGNS
// ======================================================

function renderCampaigns(campaigns) {

  const container =
    document.getElementById("campaignList");


  if (!campaigns.length) {

    container.innerHTML = `
      <div class="empty-state">
        No advertising campaigns yet.
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  campaigns.forEach(function(campaign) {

    const active =
      isCampaignActive(campaign);

    const impressions =
      Number(campaign.impressions || 0);

    const clicks =
      Number(campaign.clicks || 0);

    let ctr = 0;

    if (impressions > 0) {

      ctr =
        ((clicks / impressions) * 100).toFixed(2);

    }


    const card =
      document.createElement("div");

    card.className = "campaign-card";


    card.innerHTML = `

      <div class="campaign-image">

        <img
          src="${escapeHtml(campaign.bannerUrl)}"
          alt="${escapeHtml(campaign.businessName)}"
        >

      </div>


      <div class="campaign-info">

        <div class="campaign-top">

          <h3>
            ${escapeHtml(campaign.businessName)}
          </h3>

          <span class="status ${active ? "active" : "inactive"}">
            ${active ? "ACTIVE" : "PAUSED / EXPIRED"}
          </span>

        </div>


        <p>
          💰 Paid:
          <strong>
            ${formatMoney(campaign.amountPaid)}
          </strong>
        </p>


        <p>
          👁 Impressions:
          <strong>
            ${formatNumber(impressions)}
          </strong>
        </p>


        <p>
          🖱 Clicks:
          <strong>
            ${formatNumber(clicks)}
          </strong>
        </p>


        <p>
          📈 CTR:
          <strong>${ctr}%</strong>
        </p>


        <p class="campaign-dates">

          📅
          ${formatDate(campaign.startDate)}
          —
          ${formatDate(campaign.endDate)}

        </p>


        <div class="campaign-actions">

          <button
            class="small-btn"
            onclick="toggleCampaign('${campaign.key}', ${active})"
          >
            ${active ? "PAUSE" : "ACTIVATE"}
          </button>


          <button
            class="small-btn danger"
            onclick="deleteCampaign('${campaign.key}')"
          >
            DELETE
          </button>

        </div>

      </div>
    `;


    container.appendChild(card);

  });

}


// ======================================================
// ACTIVE CAMPAIGN CHECK
// ======================================================

function isCampaignActive(campaign) {

  if (campaign.status !== "active") {
    return false;
  }


  const now = Date.now();

  const start =
    new Date(campaign.startDate).getTime();

  const end =
    new Date(campaign.endDate).getTime();


  return now >= start && now <= end;

}


// ======================================================
// TOGGLE CAMPAIGN
// ======================================================

async function toggleCampaign(id, currentlyActive) {

  try {

    await database
      .ref("campaigns/" + id + "/status")
      .set(currentlyActive ? "paused" : "active");

  } catch (error) {

    alert(
      "Could not change campaign status: " +
      getFriendlyError(error)
    );

  }

}


// ======================================================
// DELETE CAMPAIGN
// ======================================================

async function deleteCampaign(id) {

  const confirmed =
    confirm(
      "Delete this advertising campaign permanently?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const snapshot =
      await database
        .ref("campaigns/" + id)
        .once("value");


    const campaign =
      snapshot.val();


    if (campaign && campaign.storagePath) {

      try {

        await storage
          .ref(campaign.storagePath)
          .delete();

      } catch (storageError) {

        console.warn(
          "Banner could not be deleted:",
          storageError
        );

      }

    }


    await database
      .ref("campaigns/" + id)
      .remove();


  } catch (error) {

    alert(
      "Could not delete campaign: " +
      getFriendlyError(error)
    );

  }

}


// ======================================================
// MESSAGE
// ======================================================

function showCampaignMessage(text, error) {

  campaignMessage.textContent = text;

  campaignMessage.className =
    error
      ? "message error"
      : "message success";

}


// ======================================================
// NUMBER
// ======================================================

function formatNumber(number) {

  return Number(number || 0)
    .toLocaleString("en-NG");

}


// ======================================================
// MONEY
// ======================================================

function formatMoney(number) {

  return "₦" +
    Number(number || 0)
      .toLocaleString("en-NG");

}


// ======================================================
// DATE
// ======================================================

function formatDate(date) {

  if (!date) {
    return "-";
  }


  return new Date(date)
    .toLocaleDateString("en-NG", {

      day: "numeric",
      month: "short",
      year: "numeric"

    });

}


// ======================================================
// FRIENDLY FIREBASE ERRORS
// ======================================================

function getFriendlyError(error) {

  if (!error || !error.message) {
    return "Unknown error";
  }


  return error.message
    .replace("Firebase:", "")
    .trim();

}


// ======================================================
// BASIC HTML ESCAPE
// ======================================================

function escapeHtml(value) {

  if (value === undefined || value === null) {
    return "";
  }


  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

    }
