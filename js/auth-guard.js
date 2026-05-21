/** Редирект до отрисовки: профиль без входа → главная; вход при сессии → каталог */
(function () {
  document.documentElement.classList.add("auth-checking");

  const page = document.documentElement.getAttribute("data-page");
  if (!page) {
    document.documentElement.classList.remove("auth-checking");
    return;
  }

  let session = null;
  try {
    const raw = localStorage.getItem("gym_session");
    if (raw) session = JSON.parse(raw);
  } catch (_) {}

  if (page === "profile" && !session) {
    sessionStorage.setItem("auth_need_login", "1");
    location.replace("index.html");
    return;
  }

  if (session && !session.isGuest && (page === "login" || page === "register")) {
    if (page === "login") sessionStorage.setItem("auth_already_in", "1");
    location.replace("catalog.html");
    return;
  }

  document.documentElement.classList.remove("auth-checking");
})();
