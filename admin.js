// ======================================================
// KULZZY TRAFFIC MONETIZATION V2
// ADMIN JAVASCRIPT
//
// IMPORTANT:
// Firebase Storage is NOT used.
//
// Advert banners are stored as image URLs in Realtime
// Database.
//
// ======================================================



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

const bannerUrlInput =
  document.getElementById("bannerUrl");

const imagePreview =
  document.getElementById("imagePreview");

const createCampaignBtn =
  document.getElementById("createCampaignBtn");



// ======================================================
// ADMIN UID
// ======================================================
//
// This is the Firebase Authentication UID you provided.
//
// ======================================================

const ADMIN_UID =
  "MaWXUVji3nTTRDav5ofv93hxlX83";



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

loginBtn.addEventListener(
  "click",
  async function() {

    const email =
      loginEmail.value.trim();

    const password =
      loginPassword.value;


    if (!email || !password) {

      loginMessage.textContent =
        "Please enter email and password.";

      loginMessage.className =
        "message error";

      return;

    }


    loginBtn.disabled = true;

    loginBtn.textContent =
      "LOGGING IN...";


    try {

      await auth.signInWithEmailAndPassword(
        email,
        password
      );


      loginMessage.textContent =
        "";

      loginMessage.className =
        "message";


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      loginMessage.textContent =
        "Login failed: " +
        getFriendlyError(error);

      loginMessage.className =
        "message error";

    }


    loginBtn.disabled = false;

    loginBtn.textContent =
      "LOGIN";

  }
);



// ======================================================
// ENTER KEY LOGIN
// ======================================================

loginPassword.addEventListener(
  "keydown",
  function(event) {

    if (event.key === "Enter") {

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

    try {

      await auth.signOut();

    } catch (error) {

      console.error(
        "LOGOUT ERROR:",
        error
      );

    }

  }
);



// ======================================================
// BANNER URL PREVIEW
// ======================================================

bannerUrlInput.addEventListener(
  "input",
  function() {

    const url =
      bannerUrlInput.value.trim();


    if (!url) {

      imagePreview.innerHTML =
        "";

      return;

    }


    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {

      imagePreview.innerHTML = `
        <p class="error-text">
          Image URL must start with http:// or https://
        </p>
      `;

      return;

    }


    imagePreview.innerHTML = `

      <img
        src="${escapeHtml(url)}"
        alt="Banner Preview"
        onerror="this.parentElement.innerHTML='<p class=&quot;error-text&quot;>Unable to load this image URL.</p>'"
      >

    `;

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


    // --------------------------------------------------
    // AUTH CHECK
    // --------------------------------------------------

    if (!user) {

      showCampaignMessage(
        "You must be logged in.",
        true
      );

      return;

    }


    // --------------------------------------------------
    // ADMIN CHECK
    // --------------------------------------------------

    if (user.uid !== ADMIN_UID) {

      showCampaignMessage(
        "Administrator access required.",
        true
      );

      return;

    }


    // --------------------------------------------------
    // GET FORM VALUES
    // --------------------------------------------------

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


    const bannerUrl =
      bannerUrlInput
        .value
        .trim();



    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!businessName) {

      showCampaignMessage(
        "Please enter the advertiser name.",
        true
      );

      return;

    }


    if (
      !Number.isFinite(amountPaid) ||
      amountPaid < 0
    ) {

      showCampaignMessage(
        "Please enter a valid payment amount.",
        true
      );

      return;

    }


    if (!destinationUrl) {

      showCampaignMessage(
        "Please enter the advertiser destination URL.",
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


    if (!startDate || !endDate) {

      showCampaignMessage(
        "Please select campaign start and end dates.",
        true
      );

      return;

    }


    const startTimestamp =
      new Date(startDate).getTime();

    const endTimestamp =
      new Date(endDate).getTime();


    if (
      !Number.isFinite(startTimestamp) ||
      !Number.isFinite(endTimestamp)
    ) {

      showCampaignMessage(
        "Invalid campaign dates.",
        true
      );

      return;

    }


    if (
      endTimestamp <= startTimestamp
    ) {

      showCampaignMessage(
        "Campaign end date must be after start date.",
        true
      );

      return;

    }


    if (!bannerUrl) {

      showCampaignMessage(
        "Please enter the banner image URL.",
        true
      );

      return;

    }


    if (
      !bannerUrl.startsWith("http://") &&
      !bannerUrl.startsWith("https://")
    ) {

      showCampaignMessage(
        "Banner image URL must start with http:// or https://",
        true
      );

      return;

    }



    // --------------------------------------------------
    // CHECK THAT IMAGE CAN LOAD
    // --------------------------------------------------

    try {

      await verifyImageUrl(
        bannerUrl
      );

    } catch (error) {

      showCampaignMessage(
        "The banner image could not be loaded. Check the image URL.",
        true
      );

      return;

    }



    // --------------------------------------------------
    // BUTTON STATE
    // --------------------------------------------------

    createCampaignBtn.disabled =
      true;

    createCampaignBtn.textContent =
      "CREATING...";


    showCampaignMessage(
      "Saving campaign...",
      false
    );



    try {

      // ------------------------------------------------
      // GENERATE CAMPAIGN ID
      // ------------------------------------------------

      const campaignRef =
        database.ref("campaigns").push();


      const campaignId =
        campaignRef.key;



      // ------------------------------------------------
      // CAMPAIGN OBJECT
      // ------------------------------------------------

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



      // ------------------------------------------------
      // SAVE DIRECTLY TO REALTIME DATABASE
      // ------------------------------------------------

      await campaignRef.set(
        campaign
      );



      // ------------------------------------------------
      // SUCCESS
      // ------------------------------------------------

      campaignForm.reset();

      imagePreview.innerHTML =
        "";


      showCampaignMessage(
        "Campaign created successfully!",
        false
      );


    } catch (error) {

      console.error(
        "CREATE CAMPAIGN ERROR:",
        error
      );


      showCampaignMessage(
        "Could not create campaign: " +
        getFriendlyError(error),
        true
      );

    }



    // --------------------------------------------------
    // RESTORE BUTTON
    // --------------------------------------------------

    createCampaignBtn.disabled =
      false;

    createCampaignBtn.textContent =
      "CREATE CAMPAIGN";

  }
);



// ======================================================
// VERIFY IMAGE URL
// ======================================================

function verifyImageUrl(url) {

  return new Promise(
    function(resolve, reject) {

      const image =
        new Image();


      let finished =
        false;


      const timeout =
        setTimeout(
          function() {

            if (finished) {
              return;
            }

            finished = true;

            reject(
              new Error(
                "Image loading timeout"
              )
            );

          },
          10000
        );


      image.onload =
        function() {

          if (finished) {
            return;
          }

          finished = true;

          clearTimeout(timeout);

          resolve();

        };


      image.onerror =
        function() {

          if (finished) {
            return;
          }

          finished = true;

          clearTimeout(timeout);

          reject(
            new Error(
              "Image could not load"
            )
          );

        };


      image.src =
        url;

    }
  );

}



// ======================================================
// LOAD CAMPAIGNS
// ======================================================

function loadCampaigns() {

  database
    .ref("campaigns")
    .on(
      "value",

      function(snapshot) {

        const campaigns = [];


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
          "LOAD CAMPAIGNS ERROR:",
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

  let totalImpressions =
    0;

  let totalClicks =
    0;

  let totalRevenue =
    0;

  let activeCampaigns =
    0;



  campaigns.forEach(
    function(campaign) {

      totalImpressions +=
        Number(
          campaign.impressions || 0
        );


      totalClicks +=
        Number(
          campaign.clicks || 0
        );


      totalRevenue +=
        Number(
          campaign.amountPaid || 0
        );


      if (
        isCampaignActive(
          campaign
        )
      ) {

        activeCampaigns++;

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
      activeCampaigns;


  document
    .getElementById(
      "totalImpressions"
    )
    .textContent =
      formatNumber(
        totalImpressions
      );


  document
    .getElementById(
      "totalClicks"
    )
    .textContent =
      formatNumber(
        totalClicks
      );


  document
    .getElementById(
      "totalRevenue"
    )
    .textContent =
      formatMoney(
        totalRevenue
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


  if (!campaigns.length) {

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
          campaign.impressions || 0
        );


      const clicks =
        Number(
          campaign.clicks || 0
        );


      let ctr =
        0;


      if (impressions > 0) {

        ctr =
          (
            (clicks / impressions) *
            100
          ).toFixed(2);

      }



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
              campaign.bannerUrl
            )}"
            alt="${escapeHtml(
              campaign.businessName
            )}"
            loading="lazy"
            onerror="this.style.display='none';"
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
// ACTIVE CAMPAIGN CHECK
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
        "campaigns/" +
        id +
        "/status"
      )
      .set(
        currentlyActive
          ? "paused"
          : "active"
      );


  } catch (error) {

    console.error(
      "TOGGLE ERROR:",
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

  const confirmed =
    confirm(
      "Delete this advertising campaign permanently?"
    );


  if (!confirmed) {

    return;

  }


  try {

    // --------------------------------------------------
    // REMOVE ONLY THE DATABASE RECORD
    // --------------------------------------------------
    //
    // There is NO Firebase Storage file anymore.
    //
    // --------------------------------------------------

    await database
      .ref(
        "campaigns/" +
        id
      )
      .remove();


  } catch (error) {

    console.error(
      "DELETE ERROR:",
      error
    );


    alert(
      "Could not delete campaign: " +
      getFriendlyError(error)
    );

  }

}



// ======================================================
// CAMPAIGN MESSAGE
// ======================================================

function showCampaignMessage(
  text,
  isError
) {

  campaignMessage.textContent =
    text;


  campaignMessage.className =
    isError
      ? "message error"
      : "message success";

}



// ======================================================
// NUMBER FORMAT
// ======================================================

function formatNumber(
  number
) {

  return Number(
    number || 0
  ).toLocaleString(
    "en-NG"
  );

}



// ======================================================
// MONEY FORMAT
// ======================================================

function formatMoney(
  number
) {

  return (
    "₦" +
    Number(
      number || 0
    ).toLocaleString(
      "en-NG"
    )
  );

}



// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(
  date
) {

  if (!date) {

    return "-";

  }


  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return "-";

  }


  return parsed.toLocaleDateString(
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
// SAFE URL
// ======================================================

function safeUrl(
  url
) {

  try {

    const parsed =
      new URL(url);


    if (
      parsed.protocol ===
        "https:" ||
      parsed.protocol ===
        "http:"
    ) {

      return escapeHtml(
        parsed.href
      );

    }

  } catch (error) {

    console.error(
      "Invalid URL:",
      error
    );

  }


  return "#";

}



// ======================================================
// HTML ESCAPE
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



// ======================================================
// JAVASCRIPT STRING ESCAPE
// ======================================================

function escapeJs(
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
    )

    .replace(
      /\r/g,
      "\\r"
    )

    .replace(
      /\n/g,
      "\\n"
    );

}



// ======================================================
// FRIENDLY FIREBASE ERROR
// ======================================================

function getFriendlyError(
  error
) {

  if (
    !error
  ) {

    return "Unknown error";

  }


  if (
    error.message
  ) {

    return error.message
      .replace(
        "Firebase:",
        ""
      )
      .trim();

  }


  return String(
    error
  );

}



// ======================================================
// GLOBAL FUNCTIONS
// ======================================================
//
// Needed by the buttons created inside campaign cards.
// ======================================================

window.toggleCampaign =
  toggleCampaign;

window.deleteCampaign =
  deleteCampaign;
