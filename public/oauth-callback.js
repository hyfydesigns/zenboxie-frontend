(function () {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    document.body.innerHTML = "<p style='font-family:sans-serif;text-align:center;margin-top:60px'>No token found. Please try again.</p>";
    return;
  }

  var apiBase = window.__ZENBOXIE_API__ || "";
  fetch(apiBase + "/api/auth/google/pending/" + token)
    .then(function (r) {
      if (!r.ok) throw new Error("Status " + r.status);
      return r.json();
    })
    .then(function (data) {
      if (!data.sessionId) throw new Error("No session in response");

      localStorage.setItem("oauth_session", JSON.stringify({
        sessionId: data.sessionId,
        email: data.email
      }));

      document.body.innerHTML = "<p style='font-family:sans-serif;text-align:center;margin-top:60px;color:#16a34a'>✅ Signed in! You can close this window.</p>";

      // Try to close the popup
      setTimeout(function () { window.close(); }, 500);
    })
    .catch(function (err) {
      console.error("OAuth callback error:", err);
      document.body.innerHTML = [
        "<div style='font-family:sans-serif;text-align:center;margin-top:60px'>",
        "<p style='color:#dc2626'>❌ Authentication failed: " + err.message + "</p>",
        "<p style='color:#64748b;font-size:13px'>Check the browser console for details.</p>",
        "</div>"
      ].join("");
    });
})();