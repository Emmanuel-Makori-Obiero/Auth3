// =========================================================================
// 1. SUPABASE INITIALIZATION
// =========================================================================
const sbUrl = "https://nzdvinkrxneslgajmfsh.supabase.co";
const sbKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZHZpbmtyeG5lc2xnYWptZnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTg1OTYsImV4cCI6MjA5NDUzNDU5Nn0.nKdeYOFIS4QBe0AE_SuabNvUeIDOqvhUEJL2wiiv6_s";

const supabaseClient = supabase.createClient(sbUrl, sbKey);

// =========================================================================
// 2. AUTHENTICATION MODULES
// =========================================================================

/**
 * Submits data to Supabase auth to register a brand new account
 */
async function handleSignUp(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Supabase SignUp Error:", error.message);
    alert("Registration failed: " + error.message);
  } else {
    console.log("Supabase SignUp Success:", data);

    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      alert("This email is already registered! Try logging in.");
    } else {
      alert(
        "Account created successfully! Please check your real email inbox for a confirmation link, then log in.",
      );
    }
    window.location.href = "login.html";
  }
}

/**
 * Validates credentials against Supabase auth to process sign-ins
 */
async function handleLogin(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Supabase Login Error:", error.message);
    alert("Login failed: " + error.message);
  } else {
    console.log("Supabase Login Success:", data);
    window.location.href = "dashboard.html";
  }
}

/**
 * Destroys current user session token and returns them to login
 */
async function handleLogout() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Supabase Logout Error:", error.message);
    alert("Logout failed: " + error.message);
  } else {
    console.log("Logged out successfully!");
    window.location.href = "login.html";
  }
}

// =========================================================================
// 3. INTERCEPT DOM SUBMISSIONS & ACTIONS (EVENT BRIDGES)
// =========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  // --- A. PROTECT THE DASHBOARD (Session Security Guard) ---
  const isDashboardPage = window.location.pathname.includes("dashboard.html");

  if (isDashboardPage) {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error || !session) {
      console.warn(
        "Unauthorized access intercepted. Redirecting to login window...",
      );
      window.location.href = "login.html";
      return;
    }

    // Parse the user's email into a clean handle representation for Instagram styling
    const rawEmail = session.user.email;
    const cleanHandle = rawEmail
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

    // Inject user handles into Instagram layout display sections dynamically
    const mainHeaderDisplay = document.getElementById("userEmailDisplay");
    const captionUserDisplay = document.getElementById("captionUser");
    const sidebarProfileDisplay = document.getElementById("sideEmailDisplay");

    if (mainHeaderDisplay) mainHeaderDisplay.textContent = cleanHandle;
    if (captionUserDisplay) captionUserDisplay.textContent = cleanHandle;
    if (sidebarProfileDisplay) sidebarProfileDisplay.textContent = cleanHandle;
  }

  // --- B. REGISTER & LOGIN FORMS LISTENER ---
  const activeForm = document.querySelector("form");

  if (activeForm) {
    activeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("emailAddress");
      const passwordInput = document.getElementById("password");

      if (!emailInput || !passwordInput) {
        return;
      }

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const isRegistrationPage = document.getElementById("fullName") !== null;

      if (isRegistrationPage) {
        await handleSignUp(email, password);
      } else {
        await handleLogin(email, password);
      }
    });
  }

  // --- C. DASHBOARD LOGOUT BUTTON LISTENER ---
  const logoutButton = document.getElementById("logoutBtn");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      await handleLogout();
    });
  }
});
