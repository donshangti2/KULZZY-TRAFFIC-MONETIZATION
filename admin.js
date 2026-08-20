// ======================================================
// KULZZY TRAFFIC MONETIZATION
// ADMIN PANEL
//
// Cloudinary = banner storage
// Firebase Realtime Database = campaign data
// Firebase Authentication = admin login
//
// Firebase Storage is NOT used.
// ======================================================


// ======================================================
// CLOUDINARY
// ======================================================

const CLOUDINARY_CLOUD_NAME = "s4j0x7dk";

const CLOUDINARY_UPLOAD_PRESET = "kulzzy_ads";

const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


// ======================================================
// ADMIN UID
// ======================================================

const ADMIN_UID =
  "MaWXUVji3nTTRDav5ofv93hxlX83";


// ======================================================
// ELEMENTS
// ======================================================

const loginSection =
  document.getElementById("loginSection");

const adminSection =
  document.getElementById("adminSection");

const loginBtn =
  document.getElementById("loginBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const loginEmail =
  document.getElementById("loginEmail");

const loginPassword =
  document.getElementById("loginPassword");

const loginMessage =
  document.getElementById("loginMessage");

const campaignForm =
  document.getElementById("campaignForm");

const campaignMessage =
  document.getElementById("campaignMessage");

const bannerFile =
  document.getElementById("bannerFile");

const imagePreview =
  document.getElementById("imagePreview");

const uploadStatus =
  document.getElementById("uploadStatus");

const createCampaignBtn =
  document.getElementById("createCampaignBtn");


// ======================================================
// AUTH STATE
// ======================================================

auth.onAuthStateChanged(function(user) {

  if (user) {

    if (user.uid !== ADMIN_UID) {

      auth.signOut();

      showLoginMessage(
        "This account is not authorized as administrator.",
        true
      );

      return;
    }


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

loginBtn.addEventListener(
  "click",
  async function() {

    const email =
      loginEmail.value.trim();

    const password =
      loginPassword.value;


    if (!email || !password) {

      showLoginMessage(
        "Enter your email and password.",
        true
      );

      return;
    }


    loginBtn.disabled = true;

    loginBtn.textContent =
      "LOGGING IN...";


    try {

      const result =
        await auth.signInWithEmailAndPassword(
          email,
          password
        );


      if (
        result.user.uid !==
        ADMIN_UID
      ) {

        await auth.signOut();

        throw new Error(
          "This account is not authorized."
        );

      }


      showLoginMessage(
        "",
        false
      );


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      showLoginMessage(
        getFriendlyError(error),
        true
      );

    }


    loginBtn.disabled = false;

    loginBtn.textContent =
      "LOGIN";

  }
);


// ======================================================
// ENTER KEY
// ======================================================

loginPassword.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      loginBtn.click();

    }

  }
);


// ======================================================
// LOGOUT
// ======================================================

logoutBtn.addEventListener(
  "click",
  async function() {

    await auth.signOut();

  }
);


// ======================================================
// IMAGE PREVIEW
// ======================================================

bannerFile.addEventListener(
  "change",
  function() {

    const file =
      bannerFile.files[0];


    imagePreview.innerHTML =
      "";

    uploadStatus.textContent =
      "";

    uploadStatus.className =
      "message";


    if (!file) {

      return;

    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      bannerFile.value =
        "";

      showUploadStatus(
        "Please select an image file.",
        true
      );

      return;

    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      bannerFile.value =
        "";

      showUploadStatus(
        "Image is too large. Maximum size is 10MB.",
        true
      );

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      function(event) {

        imagePreview.innerHTML = `

          <img
            src="${event.target.result}"
            alt="Banner Preview"
          >

        `;

      };


    reader.readAsDataURL(
      file
    );

  }
);


// ======================================================
// CREATE CAMPAIGN
// ======================================================

campaignForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const user =
      auth.currentUser;


    if (!user) {

      showCampaignMessage(
        "Please log in first.",
        true
      );

      return;

    }


    if (
      user.uid !==
      ADMIN_UID
    ) {

      showCampaignMessage(
        "Administrator access required.",
        true
      );

      return;

    }


    const businessName =
      document
        .getElementById("businessName")
        .value
        .trim();


    const amountPaid =
      Number(
        document
          .getElementById("amountPaid")
          .value
      );


    const destinationUrl =
      document
        .getElementById("destinationUrl")
        .value
        .trim();


    const startDate =
      document
        .getElementById("startDate")
        .value;


    const endDate =
      document
        .getElementById("endDate")
        .value;


    const file =
      bannerFile.files[0];


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!businessName) {

      showCampaignMessage(
        "Enter the advertiser name.",
        true
      );

      return;

    }


    if (
      !Number.isFinite(
        amountPaid
      ) ||
      amountPaid < 0
    ) {

      showCampaignMessage(
        "Enter a valid amount paid.",
        true
      );

      return;

    }


    if (!destinationUrl) {

      showCampaignMessage(
        "Enter the advertiser destination URL.",
        true
      );

      return;

    }


    if (
      !destinationUrl.startsWith(
        "http://"
      ) &&
      !destinationUrl.startsWith(
        "https://"
      )
    ) {

      showCampaignMessage(
        "Destination URL must begin with http:// or https://",
        true
      );

      return;

    }


    if (!startDate || !endDate) {

      showCampaignMessage(
        "Select campaign start and end dates.",
        true
      );

      return;

    }


    const start =
      new Date(
        startDate
      ).getTime();


    const end =
      new Date(
        endDate
      ).getTime();


    if (
      end <= start
    ) {

      showCampaignMessage(
        "Campaign end must be after campaign start.",
        true
      );

      return;

    }


    if (!file) {

      showCampaignMessage(
        "Select an advert banner.",
        true
      );

      return;

    }


    // ==================================================
    // BUTTON
    // ==================================================

    createCampaignBtn.disabled =
      true;

    createCampaignBtn.textContent =
      "UPLOADING BANNER...";


    showCampaignMessage(
      "",
      false
    );


    showUploadStatus(
      "Uploading banner to Cloudinary...",
      false
    );


    try {

      // =================================================
      // CLOUDINARY UPLOAD
      // =================================================

      const formData =
        new FormData();


      formData.append(
        "file",
        file
      );


      formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
      );


      formData.append(
        "folder",
        "kulzzy-ads"
      );


      const response =
        await fetch(
          CLOUDINARY_UPLOAD_URL,
          {
            method:
              "POST",

            body:
              formData
          }
        );


      const cloudinaryData =
        await response.json();


      console.log(
        "Cloudinary response:",
        cloudinaryData
      );


      if (
        !response.ok ||
        !cloudinaryData.secure_url
      ) {

        throw new Error(
          cloudinaryData.error?.message ||
          "Cloudinary upload failed."
        );

      }


      const bannerUrl =
        cloudinaryData.secure_url;


      showUploadStatus(
        "Banner uploaded successfully.",
        false
      );


      // =================================================
      // SAVE CAMPAIGN TO FIREBASE
      // =================================================

      createCampaignBtn.textContent =
        "SAVING CAMPAIGN...";


      const campaignRef =
        database
          .ref("campaigns")
          .push();


      const campaignId =
        campaignRef.key;


      const campaign = {

        id:
          campaignId,

        businessName:
          businessName,

        amountPaid:
          amountPaid,

        destinationUrl:
          destinationUrl,

        bannerUrl:
          bannerUrl,

        cloudinaryPublicId:
          cloudinaryData.public_id ||
          "",

        startDate:
          new Date(
            startDate
          ).toISOString(),

        endDate:
          new Date(
            endDate
          ).toISOString(),

        status:
          "active",

        impressions:
          0,

        clicks:
          0,

        createdAt:
          firebase.database
            .ServerValue
            .TIMESTAMP,

        createdBy:
          user.uid

      };


      await campaignRef.set(
        campaign
      );


      // =================================================
      // SUCCESS
      // =================================================

      campaignForm.reset();

      imagePreview.innerHTML =
        "";

      showUploadStatus(
        "",
        false
      );


      showCampaignMessage(
        "🎉 Campaign created successfully!",
        false
      );


    } catch (error) {

      console.error(
        "CAMPAIGN ERROR:",
        error
      );


      showCampaignMessage(
        "Campaign failed: " +
        getFriendlyError(error),
        true
      );


      showUploadStatus(
        "",
        false
      );

    }


    createCampaignBtn.disabled =
      false;

    createCampaignBtn.textContent =
      "CREATE CAMPAIGN";

  }
);


// ======================================================
// LOAD CAMPAIGNS
// ======================================================

function loadCampaigns() {

  database
    .ref("campaigns")
    .on(
      "value",
      function(snapshot) {

        const campaigns =
          [];


        snapshot.forEach(
          function(child) {

            campaigns.push({

              key:
                child.key,

              ...child.val()

            });

          }
        );


        campaigns.reverse();


        updateDashboard(
          campaigns
        );


        renderCampaigns(
          campaigns
        );

      },
      function(error) {

        console.error(
          "DATABASE ERROR:",
          error
        );


        document
          .getElementById(
            "campaignList"
          )
          .innerHTML = `

            <div class="empty-state error-text">

              Unable to load campaigns.

              <br><br>

              ${escapeHtml(
                getFriendlyError(error)
              )}

            </div>

          `;

      }
    );

}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard(
  campaigns
) {

  let impressions =
    0;

  let clicks =
    0;

  let revenue =
    0;

  let active =
    0;


  campaigns.forEach(
    function(campaign) {

      impressions +=
        Number(
          campaign.impressions ||
          0
        );


      clicks +=
        Number(
          campaign.clicks ||
          0
        );


      revenue +=
        Number(
          campaign.amountPaid ||
          0
        );


      if (
        isCampaignActive(
          campaign
        )
      ) {

        active++;

      }

    }
  );


  document
    .getElementById(
      "totalCampaigns"
    )
    .textContent =
      campaigns.length;


  document
    .getElementById(
      "activeCampaigns"
    )
    .textContent =
      active;


  document
    .getElementById(
      "totalImpressions"
    )
    .textContent =
      formatNumber(
        impressions
      );


  document
    .getElementById(
      "totalClicks"
    )
    .textContent =
      formatNumber(
        clicks
      );


  document
    .getElementById(
      "totalRevenue"
    )
    .textContent =
      formatMoney(
        revenue
      );

}


// ======================================================
// RENDER CAMPAIGNS
// ======================================================

function renderCampaigns(
  campaigns
) {

  const container =
    document.getElementById(
      "campaignList"
    );


  if (
    campaigns.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        No advertising campaigns yet.

      </div>

    `;

    return;

  }


  container.innerHTML =
    "";


  campaigns.forEach(
    function(campaign) {

      const active =
        isCampaignActive(
          campaign
        );


      const impressions =
        Number(
          campaign.impressions ||
          0
        );


      const clicks =
        Number(
          campaign.clicks ||
          0
        );


      const ctr =
        impressions > 0
          ? (
              clicks /
              impressions *
              100
            ).toFixed(2)
          : "0.00";


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "campaign-card";


      card.innerHTML = `

        <div class="campaign-image">

          <img
            src="${escapeHtml(
              campaign.bannerUrl ||
              ""
            )}"
            alt="${escapeHtml(
              campaign.businessName ||
              "Advert"
            )}"
            loading="lazy"
          >

        </div>


        <div class="campaign-info">

          <div class="campaign-top">

            <h3>
              ${escapeHtml(
                campaign.businessName
              )}
            </h3>

            <span
              class="status ${
                active
                  ? "active"
                  : "inactive"
              }"
            >

              ${
                active
                  ? "ACTIVE"
                  : "PAUSED / EXPIRED"
              }

            </span>

          </div>


          <p>
            💰 Paid:
            <strong>
              ${formatMoney(
                campaign.amountPaid
              )}
            </strong>
          </p>


          <p>
            👁 Impressions:
            <strong>
              ${formatNumber(
                impressions
              )}
            </strong>
          </p>


          <p>
            🖱 Clicks:
            <strong>
              ${formatNumber(
                clicks
              )}
            </strong>
          </p>


          <p>
            📈 CTR:
            <strong>
              ${ctr}%
            </strong>
          </p>


          <p>
            🔗 Destination:

            <a
              href="${safeUrl(
                campaign.destinationUrl
              )}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit
            </a>
          </p>


          <p class="campaign-dates">

            📅
            ${formatDate(
              campaign.startDate
            )}

            —

            ${formatDate(
              campaign.endDate
            )}

          </p>


          <div class="campaign-actions">

            <button
              class="small-btn"
              type="button"
              onclick="toggleCampaign(
                '${escapeJs(
                  campaign.key
                )}',
                ${active}
              )"
            >

              ${
                active
                  ? "PAUSE"
                  : "ACTIVATE"
              }

            </button>


            <button
              class="small-btn danger"
              type="button"
              onclick="deleteCampaign(
                '${escapeJs(
                  campaign.key
                )}'
              )"
            >

              DELETE

            </button>

          </div>

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );

}


// ======================================================
// ACTIVE CAMPAIGN
// ======================================================

function isCampaignActive(
  campaign
) {

  if (
    campaign.status !==
    "active"
  ) {

    return false;

  }


  const now =
    Date.now();


  const start =
    new Date(
      campaign.startDate
    ).getTime();


  const end =
    new Date(
      campaign.endDate
    ).getTime();


  return (
    now >= start &&
    now <= end
  );

}


// ======================================================
// TOGGLE CAMPAIGN
// ======================================================

async function toggleCampaign(
  id,
  currentlyActive
) {

  try {

    await database
      .ref(
        `campaigns/${id}/status`
      )
      .set(
        currentlyActive
          ? "paused"
          : "active"
      );

  } catch (error) {

    console.error(
      error
    );

    alert(
      "Could not change campaign status: " +
      getFriendlyError(error)
    );

  }

}


// ======================================================
// DELETE CAMPAIGN
// ======================================================

async function deleteCampaign(
  id
) {

  if (
    !confirm(
      "Delete this advertising campaign?"
    )
  ) {

    return;

  }


  try {

    await database
      .ref(
        `campaigns/${id}`
      )
      .remove();


  } catch (error) {

    console.error(
      error
    );


    alert(
      "Could not delete campaign: " +
      getFriendlyError(error)
    );

  }

}


// ======================================================
// MESSAGES
// ======================================================

function showLoginMessage(
  text,
  error
) {

  loginMessage.textContent =
    text;

  loginMessage.className =
    error
      ? "message error"
      : "message";

}


function showCampaignMessage(
  text,
  error
) {

  campaignMessage.textContent =
    text;

  campaignMessage.className =
    error
      ? "message error"
      : "message success";

}


function showUploadStatus(
  text,
  error
) {

  uploadStatus.textContent =
    text;

  uploadStatus.className =
    error
      ? "message error"
      : "message success";

}


// ======================================================
// FORMATTING
// ======================================================

function formatNumber(
  value
) {

  return Number(
    value || 0
  ).toLocaleString(
    "en-NG"
  );

}


function formatMoney(
  value
) {

  return (
    "₦" +
    Number(
      value || 0
    ).toLocaleString(
      "en-NG"
    )
  );

}


function formatDate(
  value
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }


  return date.toLocaleDateString(
    "en-NG",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric"
    }
  );

}


// ======================================================
// SECURITY HELPERS
// ======================================================

function escapeHtml(
  value
) {

  if (
    value === undefined ||
    value === null
  ) {

    return "";
  }


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeJs(
  value
) {

  return String(
    value || ""
  )

    .replace(
      /\\/g,
      "\\\\"
    )

    .replace(
      /'/g,
      "\\'"
    )

    .replace(
      /"/g,
      '\\"'
    );

}


function safeUrl(
  value
) {

  try {

    const url =
      new URL(value);


    if (
      url.protocol === "http:" ||
      url.protocol === "https:"
    ) {

      return escapeHtml(
        url.href
      );

    }

  } catch (error) {}

  return "#";

}


function getFriendlyError(
  error
) {

  if (!error) {
    return "Unknown error";
  }


  if (error.message) {
    return error.message
      .replace(
        "Firebase:",
        ""
      )
      .trim();
  }


  return String(error);

}


// ======================================================
// GLOBAL BUTTON FUNCTIONS
// ======================================================

window.toggleCampaign =
  toggleCampaign;

window.deleteCampaign =
  deleteCampaign;
