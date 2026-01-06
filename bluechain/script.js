// ===============================
// 🔥 FIREBASE IMPORTS
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


// ===============================
// 🔥 FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAnrXDyr6P3-g7hnNFn4RQK4QogDwvXOsg",
  authDomain: "bluechain-406d2.firebaseapp.com",
  projectId: "bluechain-406d2",
  storageBucket: "bluechain-406d2.firebasestorage.app",
  messagingSenderId: "405112484276",
  appId: "1:405112484276:web:5773aa70fb46d9a35042e1"
};

// ===============================
// 🔥 INITIALIZE FIREBASE
// ===============================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


console.log("🔥 Firebase connected");

// ===============================
// 🧮 LIVE CARBON IMPACT CALCULATION (REGISTER PAGE)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const ecosystemSelect = document.getElementById("ecosystem");
  const areaInput = document.getElementById("area");
  const co2Field = document.getElementById("co2");

  if (!ecosystemSelect || !areaInput || !co2Field) return;

  // Average sequestration values (tCO₂ per hectare per year)
  const carbonRates = {
    "Mangrove": 6,
    "Salt Marsh": 5,
    "Seagrass": 4
  };

  function calculateCarbonImpact() {
    const ecosystem = ecosystemSelect.value;
    const area = Number(areaInput.value);

    if (!ecosystem || !area || area <= 0) {
      co2Field.value = "";
      return;
    }

    const rate = carbonRates[ecosystem];
    const estimatedImpact = area * rate;

    // Rounded for clean UI
    co2Field.value = estimatedImpact.toFixed(2);
    document.getElementById("carbonDisplay").textContent =
    estimatedImpact.toFixed(2);
    document.getElementById("co2").value =
    estimatedImpact.toFixed(2);
  }

  ecosystemSelect.addEventListener("change", calculateCarbonImpact);
  areaInput.addEventListener("input", calculateCarbonImpact);
});
// ===============================
// 🟢 PROJECT REGISTRATION (FINAL — SAFE VERSION)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const projectForm = document.getElementById("projectForm");
  if (!projectForm) return;

  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🚀 Project submit clicked");

    try {
      // ✅ GET EMAIL FIRST (THIS IS THE FIX)
      const email = document.getElementById("email")?.value;

      // 🛑 HARD STOP if email missing
      if (!email) {
        alert("❌ Contact email is required");
        return;
      }

      // 🔐 CHECK: Is this email a registered Project Owner?
      const ownerQuery = query(
        collection(db, "projectOwners"),
        where("email", "==", email)
      );
      const ownerSnap = await getDocs(ownerQuery);

      if (ownerSnap.empty) {
        alert(
          "❌ This email is not registered as a Project Owner.\n\n" +
          "Please register as a Project Owner first from the Credits section."
        );
        return;
      }

      // ✅ REQUIRED FIELDS (ONLY what exists in HTML)
      const projectName = document.getElementById("projectName")?.value;
      const organization = document.getElementById("organization")?.value;
      const ecosystem = document.getElementById("ecosystem")?.value;
      const area = Number(document.getElementById("area")?.value);
      const co2 = Number(document.getElementById("co2")?.value);

      // 🧾 IMAGE / COMPANY PROOF URLS
      const imageInput = document.getElementById("images");
      let imageUrls = [];

      if (imageInput && imageInput.value.trim() !== "") {
        imageUrls = imageInput.value
          .split(",")
          .map(url => url.trim())
          .filter(url => url.length > 0);
      }

      // 🛑 HARD VALIDATION
      if (!projectName || !organization || !ecosystem || !area || !co2) {
        alert("❌ Please fill all required fields");
        return;
      }

      // 🔥 SAVE TO FIRESTORE
      await addDoc(collection(db, "projects"), {
        projectName,
        organization,
        ecosystem,
        area,
        co2,
        email,
        images: imageUrls,
        status: "Pending",
        creditsStatus: "Not Allotted",
        createdAt: new Date()
      });

      alert("✅ Project submitted successfully!");
      projectForm.reset();

    } catch (error) {
      console.error("❌ Project submission error:", error);
      alert("❌ Submission failed. Check console.");
    }
  });
});
// 🕵️ VERIFIER REGISTRATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verifierRegisterForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "verifiers"), {
        name: verifierName.value,
        role: verifierRole.value,
        otherRole: verifierOtherRole.value,
        organization: verifierOrg.value,
        experience: verifierExperience.value,
        reason: verifierReason.value,
        email: verifierEmail.value,
        password: verifierPassword.value,
        status: "Pending",
        createdAt: new Date()
      });

      alert("Application submitted. Await approval.");
      window.location.href = "verify-login.html";
    } catch (err) {
      console.error(err);
      alert("❌ Registration failed");
    }
  });
});

// ===============================
// 🔐 VERIFIER LOGIN
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const verifierLoginForm = document.getElementById("verifierLoginForm");
  if (!verifierLoginForm) return;

  verifierLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail")?.value;
    const password = document.getElementById("loginPassword")?.value;

    const q = query(
      collection(db, "verifiers"),
      where("email", "==", email),
      where("password", "==", password),
      where("status", "==", "Approved")
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      localStorage.setItem("verifierEmail", email); 
      window.location.href = "verify-dashboard.html";
    } else {
      alert("Invalid credentials or not approved yet");
    }
  });
});

// ===============================
// 📋 VERIFIER DASHBOARD (ENHANCED UI)
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("verifierProjects");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "projects"));
  container.innerHTML = "";

  let hasPending = false;

  snapshot.forEach((docSnap) => {
    const project = docSnap.data();
    if (project.status !== "Pending") return;

    hasPending = true;

    const card = document.createElement("div");
    card.className = "project-card";

    const imageSrc =
      Array.isArray(project.images) && project.images.length > 0
        ? project.images[0]
        : "images/mangrove-hero.jpg";

    card.innerHTML = `
      <img src="${imageSrc}" alt="Project proof">

      <div class="project-body">
        <h3>${project.projectName}</h3>

        <p class="org">${project.organization || "Unknown Organization"}</p>

        <p class="meta">
          🌱 Ecosystem: <strong>${project.ecosystem}</strong><br>
          📏 Area Requested: <strong>${project.area} hectares</strong><br>
          🌍 Estimated Carbon Impact:
          <strong>${project.estimatedCarbon || project.co2} tCO₂ / year</strong><br>
          📧 Contact: ${project.email}
        </p>

        <div style="display:flex; gap:10px; margin-top:14px;">
          <button class="submit-btn"
            style="background:#1b7f5a;"
            onclick="approveProject('${docSnap.id}')">
            Approve for Allocation
          </button>
          <p style="font-size:0.75rem; color:#888; margin-top:6px;">
            ${project.allocationStatus !== "Allocated"
              ? "⚠️ Allocate land before approval"
              : "✅ Land allocated"}
          </p>


          <button class="submit-btn"
            style="background:#d9534f;"
            onclick="rejectProject('${docSnap.id}')">
            Reject
          </button>
        </div>
      </div>
  
    <hr style="margin:14px 0; opacity:0.3;" />
    <h4>🌍 Land Allocation</h4>
    <label>State</label>
    <select id="state-${docSnap.id}" onchange="loadDistricts('${docSnap.id}')">
    <option value="">Select state</option>
    <option value="Kerala">Kerala</option>
    <option value="TamilNadu">Tamil Nadu</option>
    </select>
    <label>District</label>
    <select id="district-${docSnap.id}">
    <option value="">Select district</option>
    </select>
    <p class="meta" id="available-${docSnap.id}">
    Available land: —
    </p>
    <button class="submit-btn"
    style="background:#1b7f5a;"
    onclick="allocateLand('${docSnap.id}', ${project.area})">
    Allocate ${project.area} hectares
    </button>

    `;

    container.appendChild(card);
  });

  if (!hasPending) {
    container.innerHTML = `
      <p style="text-align:center; color:#666; font-size:0.95rem;">
        No pending projects awaiting verification.
      </p>
    `;
  }
});

// ===============================
// ✅ PROJECT ACTIONS (UNCHANGED LOGIC)
// ===============================


window.approveProject = async (id) => {
  const projectRef = doc(db, "projects", id);
  const snap = await getDoc(projectRef);

  if (!snap.exists()) {
    alert("❌ Project not found");
    return;
  }

  const project = snap.data();

  // 🚨 HARD BLOCK
  if (project.allocationStatus !== "Allocated") {
    alert("❌ Please allocate land before approving");
    return;
  }

  await updateDoc(projectRef, {
    status: "Verified",
    verifiedAt: new Date()
  });

  alert("✅ Project verified after land allocation");
  location.reload();
};

window.rejectProject = async (id) => {
  await updateDoc(doc(db, "projects", id), {
    status: "Rejected"
  });
  alert("❌ Project rejected.");
  location.reload();
};

window.requestInfo = async (id) => {
  await updateDoc(doc(db, "projects", id), {
    status: "Needs More Info"
  });
  alert("ℹ️ Clarification requested from project owner.");
  location.reload();
};
// ===============================
// 🏛️ CREDITS ADMIN LOGIN (DEMO)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const adminForm = document.getElementById("adminLoginForm");
  if (!adminForm) return;

  adminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (adminUsername.value === "admin" && adminPassword.value === "root") {
      window.location.href = "credits-admin.html";
    } else {
      adminError.style.display = "block";
    }
  });
});

// ===============================
// 🧾 VERIFIER APPROVAL — CREDITS ADMIN DASHBOARD
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const verifierContainer = document.getElementById("verifierRequests");
  if (!verifierContainer) return;

  verifierContainer.innerHTML = "";

  try {
    const q = query(
      collection(db, "verifiers"),
      where("status", "==", "Pending")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      verifierContainer.innerHTML = `
        <p style="text-align:center; color:#666; font-size:0.9rem;">
          No pending verifier applications.
        </p>
      `;
      return;
    }

    snapshot.forEach((docSnap) => {
      const v = docSnap.data();

      const card = document.createElement("div");
      card.className = "project-card";

      card.innerHTML = `
        <div class="project-body">
          <h3>${v.name}</h3>

          <p class="meta">
            🧑‍💼 Role: ${v.role}${v.otherRole ? ` (${v.otherRole})` : ""}<br>
            🏢 Organization: ${v.organization}<br>
            📊 Experience: ${v.experience} years<br>
            📧 Email: ${v.email}<br>
            🟡 Status: <strong>Pending Approval</strong>
          </p>

          <div style="display:flex; gap:10px; margin-top:12px;">
            <button class="submit-btn"
              style="background:#1b7f5a;"
              onclick="approveVerifier('${docSnap.id}')">
              Approve Verifier
            </button>

            <button class="submit-btn"
              style="background:#d9534f;"
              onclick="rejectVerifier('${docSnap.id}')">
              Reject
            </button>
          </div>
        </div>
      `;

      verifierContainer.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Error loading verifier requests:", err);
    verifierContainer.innerHTML = `
      <p style="color:#d9534f; text-align:center;">
        Failed to load verifier applications.
      </p>
    `;
  }
});

// ===============================
// ✅ APPROVE VERIFIER
// ===============================
window.approveVerifier = async (verifierId) => {
  try {
    await updateDoc(doc(db, "verifiers", verifierId), {
      status: "Approved",
      approvedAt: new Date()
    });

    alert("✅ Verifier approved. Login enabled.");
    location.reload();

  } catch (err) {
    console.error("❌ Error approving verifier:", err);
    alert("Approval failed. Check console.");
  }
};

// ===============================
// ❌ REJECT VERIFIER
// ===============================
window.rejectVerifier = async (verifierId) => {
  try {
    await updateDoc(doc(db, "verifiers", verifierId), {
      status: "Rejected",
      rejectedAt: new Date()
    });

    alert("❌ Verifier rejected.");
    location.reload();

  } catch (err) {
    console.error("❌ Error rejecting verifier:", err);
    alert("Rejection failed. Check console.");
  }
};
// ===============================
// 🧑‍💼 PROJECT OWNER REGISTRATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const ownerRegisterForm = document.getElementById("ownerRegisterForm");
  if (!ownerRegisterForm) return;

  ownerRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const ownerData = {
        organization: document.getElementById("ownerOrganization").value,
        email: document.getElementById("ownerEmail").value,
        password: document.getElementById("ownerPassword").value,
        createdAt: new Date()
      };

      await addDoc(collection(db, "projectOwners"), ownerData);

      alert("✅ Registration successful. You can now login.");
      ownerRegisterForm.reset();
      window.location.href = "credits-owner-login.html";

    } catch (err) {
      console.error(err);
      alert("❌ Registration failed");
    }
  });
});

// ===============================
// 🔐 PROJECT OWNER LOGIN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const ownerLoginForm = document.getElementById("ownerLoginForm");
  if (!ownerLoginForm) return;

  ownerLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("ownerLoginEmail").value;
    const password = document.getElementById("ownerLoginPassword").value;

    const q = query(
      collection(db, "projectOwners"),
      where("email", "==", email),
      where("password", "==", password)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      localStorage.setItem("ownerEmail", email);
      alert("✅ Login successful");
      window.location.href = "credits-owner-dashboard.html";
    } else {
      alert("❌ Invalid email or password");
    }
  });
});

// ===============================
// 🏛️ CREDITS ADMIN DASHBOARD – VERIFIED PROJECTS
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("creditProjects");
  if (!container) return;

  container.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "projects"));

    let hasProjects = false;

    snapshot.forEach((docSnap) => {
      const project = docSnap.data();

      // ✅ ONLY SHOW PROJECTS READY FOR CREDIT DECISION
      if (
        project.status !== "Verified" ||
        project.allocationStatus !== "Allocated"
      ) {
        return;
      }

      hasProjects = true;

      const card = document.createElement("div");
      card.className = "project-card";

      const imageSrc =
        Array.isArray(project.images) && project.images.length > 0
          ? project.images[0]
          : "images/mangrove-hero.jpg";

      card.innerHTML = `
        <img src="${imageSrc}" alt="Project proof">

        <div class="project-body">
          <h3>${project.projectName}</h3>

          <p class="meta">
            🏭 <strong>Organization:</strong> ${project.organization}<br>
            🌱 <strong>Ecosystem:</strong> ${project.ecosystem}<br>
            📏 <strong>Area:</strong> ${project.area} hectares<br>
            🌍 <strong>Estimated Carbon:</strong> ${project.co2} tCO₂ / year
          </p>

          <hr style="margin:12px 0; opacity:0.3;">

          <p class="meta">
            📍 <strong>Land Allocated:</strong><br>
            State: ${project.allocation?.state}<br>
            District: ${project.allocation?.district}<br>
            Area: ${project.allocation?.hectares} hectares
          </p>

          <label>Carbon Credits to Allot</label>
          <input
            type="number"
            id="credits-${docSnap.id}"
            placeholder="e.g. 250"
            style="margin-bottom:8px;"
          />

          <label>Authority Remarks</label>
          <textarea
            id="remarks-${docSnap.id}"
            rows="3"
            placeholder="Verification notes / approval reason"
          ></textarea>

          <div style="display:flex; gap:12px; margin-top:14px;">
            <button
              class="submit-btn"
              style="background:#1b7f5a;"
              onclick="approveAndAllot('${docSnap.id}')">
              Approve & Allot Credits
            </button>

            <button
              class="submit-btn"
              style="background:#d9534f;"
              onclick="rejectCredits('${docSnap.id}')">
              Reject Project
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    if (!hasProjects) {
      container.innerHTML = `
        <p style="text-align:center; color:#666; font-size:0.95rem;">
          No verified projects awaiting carbon credit approval.
        </p>
      `;
    }

  } catch (err) {
    console.error("❌ Credits admin load error:", err);
    container.innerHTML = `
      <p style="text-align:center; color:#d9534f;">
        Failed to load verified projects.
      </p>
    `;
  }
});

// ===============================
// ✅ APPROVE & ALLOT CREDITS
// ===============================
window.approveAndAllot = async (projectId) => {
  const creditsInput = document.getElementById(`credits-${projectId}`);
  const remarksInput = document.getElementById(`remarks-${projectId}`);

  const credits = Number(creditsInput.value);
  const remarks = remarksInput.value || "Credits allotted after verification";

  if (!credits || credits <= 0) {
    alert("Please enter valid credits");
    return;
  }

  await updateDoc(doc(db, "projects", projectId), {
    status: "Credits Allotted",
    creditsAllotted: credits,
    creditsRemarks: remarks,
    creditsApprovedAt: new Date()
  });

  alert("✅ Credits allotted successfully");
  location.reload();
};

// ===============================
// ❌ REJECT CREDIT ALLOTMENT
// ===============================
window.rejectCredits = async (projectId) => {
  const remarksInput = document.getElementById(`remarks-${projectId}`);
  const remarks = remarksInput.value;

  if (!remarks || remarks.trim() === "") {
    alert("Please provide a rejection reason");
    return;
  }

  await updateDoc(doc(db, "projects", projectId), {
    status: "Rejected by Authority",
    creditsRemarks: remarks,
    creditsRejectedAt: new Date()
  });

  alert("❌ Project rejected");
  location.reload();
};

// ===============================
// 🌍 PUBLIC TRANSPARENCY LEDGER
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("publicProjects");
  const searchInput = document.getElementById("searchInput");

  // ⛔ If this page doesn't have publicProjects, do nothing
  if (!grid) return;

  let allProjects = [];

  try {
    const snapshot = await getDocs(collection(db, "projects"));
    grid.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const project = docSnap.data();

      if (project.status === "Credits Allotted") {
        allProjects.push(project);
      }
    });

    if (allProjects.length === 0) {
      grid.innerHTML = `
        <p style="text-align:center; color:#666;">
          No credited projects available yet.
        </p>
      `;
      return;
    }

    renderProjects(allProjects);

  } catch (err) {
    console.error("❌ Public ledger error:", err);
  }

  // 🔍 SEARCH
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();

      const filtered = allProjects.filter(p =>
        (p.projectName || "").toLowerCase().includes(term) ||
        (p.organization || "").toLowerCase().includes(term)
      );

      renderProjects(filtered);
    });
  }

  // 🧱 RENDER
  function renderProjects(projects) {
    grid.innerHTML = "";

    projects.forEach(project => {

      const card = document.createElement("div");
      card.className = "project-card";

      card.innerHTML = `
        <div class="project-body">
          <h3>${project.projectName}</h3>
          <p class="org">${project.organization}</p>

          <p class="meta">
            🌱 ${project.ecosystem}<br>
            📏 ${project.area} hectares<br>
            🌍 Credits Allotted: <strong>${project.creditsAllotted}</strong>
          </p>

          <span class="status verified">✔ Publicly Verified</span>
       </div>
     `;

      grid.appendChild(card);
    });
  }
});


// ===============================
// 🌍 LAND ALLOCATION HELPERS
// ===============================


window.loadDistricts = async (projectId) => {
  const state = document.getElementById(`state-${projectId}`).value;
  const districtSelect = document.getElementById(`district-${projectId}`);
  const availableText = document.getElementById(`available-${projectId}`);

  districtSelect.innerHTML = "<option>Loading...</option>";
  availableText.textContent = "Available land: —";

  if (!state) return;

  const snap = await getDoc(doc(db, "landPool", state));
  if (!snap.exists()) return;

  const districts = snap.data().districts || {};
  districtSelect.innerHTML = "<option value=''>Select district</option>";

  Object.keys(districts).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = `${d} (${districts[d]} ha available)`;
    districtSelect.appendChild(opt);
  });

  districtSelect.onchange = () => {
    availableText.textContent =
      `Available land: ${districts[districtSelect.value] || 0} hectares`;
  };
};

window.allocateLand = async (projectId, areaRequired) => {
  const state = document.getElementById(`state-${projectId}`).value;
  const district = document.getElementById(`district-${projectId}`).value;

  if (!state || !district) {
    alert("Select state and district");
    return;
  }

  const stateRef = doc(db, "landPool", state);
  const stateSnap = await getDoc(stateRef);

  if (!stateSnap.exists()) {
    alert("State not found in land pool");
    return;
  }

  const districts = stateSnap.data().districts || {};

  if ((districts[district] || 0) < areaRequired) {
    alert("Not enough land available");
    return;
  }

  // 🔻 Reduce land
  districts[district] -= areaRequired;

  await updateDoc(stateRef, { districts });

  // ✅ Store allocation in project
  await updateDoc(doc(db, "projects", projectId), {
    allocation: {
      state,
      district,
      hectares: areaRequired
    },
    allocationStatus: "Allocated"
  });

  // 📜 Allocation log
  await addDoc(collection(db, "allocations"), {
    projectId,
    state,
    district,
    hectares: areaRequired,
    allocatedAt: new Date()
  });

  alert("✅ Land allocated successfully");
  location.reload();
};
// ===============================
// 🧑‍💼 PROJECT OWNER DASHBOARD
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("ownerProjects");
  if (!container) return;

  const ownerEmail = localStorage.getItem("ownerEmail");
  if (!ownerEmail) {
    container.innerHTML = `
      <p style="text-align:center; color:#d9534f;">
        Please login to view your projects.
      </p>
    `;
    return;
  }

  container.innerHTML = "";

  const q = query(
    collection(db, "projects"),
    where("email", "==", ownerEmail)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    container.innerHTML = `
      <p style="text-align:center; color:#666;">
        You have not registered any projects yet.
      </p>
    `;
    return;
  }

  snapshot.forEach(docSnap => {
    const p = docSnap.data();

    const card = document.createElement("div");
    card.className = "project-card";

    const imageSrc =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images[0]
        : "images/mangrove-hero.jpg";

    let statusBlock = "";

    if (p.status === "Pending") {
      statusBlock = `<p class="meta">⏳ Awaiting verifier review</p>`;
    }

    if (p.status === "Verified" && p.allocationStatus === "Allocated") {
      statusBlock = `
        <div class="credit-box">
          🌱 Land allocated in <strong>${p.allocation.state}</strong>,
          <strong>${p.allocation.district}</strong><br>
          📏 Area: ${p.allocation.hectares} hectares<br>
          ⏳ Waiting for government credit approval
        </div>
      `;
    }

    if (p.status === "Credits Allotted") {
      statusBlock = `
        <div class="credit-box">
          ✅ <strong>Credits Approved</strong><br>
          🌍 Credits: ${p.creditsAllotted}<br>
          📝 Remarks: ${p.creditsRemarks || "—"}<br>

          <button class="submit-btn pay-btn"
            onclick="simulatePayment('${docSnap.id}')">
            Pay Now
          </button>

          <button class="submit-btn cancel-btn"
            onclick="cancelPayment()">
            Cancel
          </button>
        </div>
      `;
    }

    if (p.paymentStatus === "Paid") {
      statusBlock = `
        <div class="credit-box">
          💳 Payment Successful<br>
          🟢 Credits Issued<br>
          🔐 Credit Certificate ID:
          <strong>${p.creditCertificateId}</strong>
        </div>
      `;
    }

    card.innerHTML = `
      <img src="${imageSrc}">
      <div class="project-body">
        <h3>${p.projectName}</h3>
        <p class="org">${p.organization}</p>
        <p class="meta">
          🌱 ${p.ecosystem}<br>
          📏 ${p.area} hectares<br>
          📊 Status: <strong>${p.status}</strong>
        </p>
        ${statusBlock}
      </div>
    `;

    container.appendChild(card);
  });
});

// ===============================
// 💳 PAYMENT SIMULATION
// ===============================
window.simulatePayment = async (projectId) => {
  const certId = "BC-" + Math.random().toString(16).slice(2, 10).toUpperCase();

  await updateDoc(doc(db, "projects", projectId), {
    paymentStatus: "Paid",
    creditCertificateId: certId,
    paidAt: new Date()
  });

  alert("💳 Payment successful. Credits issued!");
  location.reload();
};

window.cancelPayment = () => {
  alert("❌ Payment cancelled");
};
// 👤 Project Owner identity badge
document.addEventListener("DOMContentLoaded", () => {
  const badge = document.getElementById("ownerEmailBadge");
  if (!badge) return;

  const ownerEmail = localStorage.getItem("ownerEmail");
  badge.textContent = ownerEmail
    ? `Logged in as Project Owner • ${ownerEmail}`
    : "Logged in as Project Owner";
});


