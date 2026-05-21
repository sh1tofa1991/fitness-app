/**
 * Проверка входа до отрисовки страницы — без «мигания» профиля и главной.
 */
(function () {
  document.documentElement.classList.add("auth-checking");

  var page = document.documentElement.getAttribute("data-page");
  if (!page) {
    document.documentElement.classList.remove("auth-checking");
    return;
  }

  var session = null;
  try {
    var raw = localStorage.getItem("gym_session");
    if (raw) session = JSON.parse(raw);
  } catch (e) {
    session = null;
  }

  var KEY_NEED_LOGIN = "auth_need_login";
  var KEY_ALREADY_IN = "auth_already_in";

  if (page === "profile" && !session) {
    sessionStorage.setItem(KEY_NEED_LOGIN, "1");
    location.replace("index.html");
    return;
  }

  if (session && !session.isGuest && (page === "login" || page === "register")) {
    if (page === "login") sessionStorage.setItem(KEY_ALREADY_IN, "1");
    location.replace("catalog.html");
    return;
  }

  document.documentElement.classList.remove("auth-checking");
})();
