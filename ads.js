// ======================================================
// KULZZY TRAFFIC MONETIZATION V1
// PUBLIC ADVERTISING ENGINE
// ======================================================

let activeCampaigns = [];
let currentCampaign = null;


// ======================================================
// LOAD CAMPAIGNS
// ======================================================

function loadAdvertisements() {

  database
    .ref("campaigns")
    .on("value", function(snapshot) {

      const now = Date.now();

      activeCampaigns = [];


      snapshot.forEach(function(child) {

        const campaign = child.val();


        if (
          campaign.status === "active" &&
          campaign.bannerUrl &&
          campaign.destinationUrl
        ) {

          const start =
            new Date(campaign.startDate).getTime();

          const end =
            new Date(campaign.endDate).getTime();


          if (
            now >= start &&
            now <= end
          ) {

            activeCampaigns.push({
              id: child.key,
              ...campaign
            });

          }

        }

      });


      displayRandomAdvertisement();

    });

}


// ======================================================
// DISPLAY RANDOM AD
// ======================================================

function displayRandomAdvertisement() {

  const container =
    document.getElementById("kulzzyAdContainer");


  if (!container) {
    return;
  }


  if (!activeCampaigns.length) {

    container.innerHTML = `
      <div class="no-ad">
        <span>📢</span>

        <strong>
          Advertise With Kulzzy Radio
        </strong>

        <small>
          Put your business in front of our listeners.
        </small>

        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener"
        >
          Contact Us
        </a>
      </div>
    `;

    return;
  }


  const randomIndex =
    Math.floor(
      Math.random() * activeCampaigns.length
    );


  currentCampaign =
    activeCampaigns[randomIndex];


  container.innerHTML = `

    <div class="kulzzy-ad">

      <div class="ad-label">
        ADVERTISEMENT
      </div>

      <a
        href="${safeUrl(currentCampaign.destinationUrl)}"
        target="_blank"
        rel="noopener noreferrer sponsored"
        onclick="registerAdClick(event)"
      >

        <img
          src="${escapeHtml(currentCampaign.bannerUrl)}"
          alt="${escapeHtml(currentCampaign.businessName)}"
        >

      </a>

    </div>

  `;


  registerAdImpression(currentCampaign.id);

}


// ======================================================
// IMPRESSION
// ======================================================

async function registerAdImpression(campaignId) {
  if (!campaignId) {
    console.error("No campaign ID for impression.");
    return;
  }

  const impressionRef = database.ref(
    `campaigns/${campaignId}/impressions`
  );

  try {
    await impressionRef.transaction(function(currentValue) {
      return (Number(currentValue) || 0) + 1;
    });

    console.log(
      "✅ Impression registered:",
      campaignId
    );

  } catch (error) {
    console.error(
      "❌ Impression registration failed:",
      error
    );
  }
}


// ======================================================
// CLICK
// ======================================================

function registerAdClick(event) {

  if (!currentCampaign) {
    return;
  }


  const campaignId =
    currentCampaign.id;


  database
    .ref(
      "campaigns/" +
      campaignId +
      "/clicks"
    )
    .transaction(function(currentValue) {

      return Number(currentValue || 0) + 1;

    });

}


// ======================================================
// SAFE URL
// ======================================================

function safeUrl(url) {

  try {

    const parsed =
      new URL(url);


    if (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    ) {

      return escapeHtml(parsed.href);

    }

  } catch (error) {

    console.error("Invalid advert URL");

  }


  return "#";

}


// ======================================================
// HTML ESCAPE
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


// ======================================================
// START
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadAdvertisements();

  }
);
