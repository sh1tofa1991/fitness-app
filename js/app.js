/**
 * COOLBOYDRACO GYM — клиентское приложение (localStorage)
 */
(function () {
  const KEYS = {
    users: "gym_users",
    session: "gym_session",
    customWorkouts: "gym_custom_workouts",
    saved: "gym_saved",
    history: "gym_history",
    settings: "gym_settings",
  };

  const DEFAULT_WORKOUTS = [
    { id: "w1", title: "Всё тело 45", category: "Силовые", type: "Силовая", duration: 45, level: "средний", image: "assets/workouts/w1.png" },
    { id: "w2", title: "Утренняя мобильность", category: "Растяжка", type: "Мобилити", duration: 20, level: "лёгкий", image: "assets/workouts/w2.png" },
    { id: "w3", title: "Кор и пресс", category: "Силовые", type: "Кор и пресс", duration: 25, level: "средний", image: "assets/workouts/w3.png" },
    { id: "w4", title: "Интервалы 20", category: "Кардио", type: "Интервалы", duration: 20, level: "высокий", image: "assets/workouts/w4.png" },
    { id: "w5", title: "День ног", category: "Силовые", type: "Ноги", duration: 50, level: "продвинутый", image: "assets/workouts/w5.png" },
    { id: "w6", title: "Растяжка-разгрузка", category: "Растяжка", type: "Растяжка", duration: 15, level: "лёгкий", image: "assets/workouts/w6.png" },
  ];

  const CUSTOM_WORKOUT_IMAGE = "assets/workouts/custom.svg";

  const CATEGORIES = ["Все", "Силовые", "Кардио", "Растяжка", "Йога", "Для дома", "Для зала"];

  const I18N = {
    ru: {
      "nav.home": "Главная",
      "nav.catalog": "Каталог",
      "nav.profile": "Профиль",
      "nav.settings": "Настройки",
      "settings.notifications": "Уведомления",
      "settings.language": "Язык",
      "settings.theme": "Тема",
      "settings.general": "Общие настройки",
      "settings.account": "Аккаунт",
      "catalog.title": "Каталог тренировок",
      "catalog.create": "+ Создать тренировку",
      "catalog.categories": "Категории",
      "catalog.search": "Поиск тренировки",
      "btn.save": "Сохранить",
      "btn.open": "Открыть",
      "btn.delete": "Удалить",
      "on": "ВКЛ",
      "off": "ВЫКЛ",
      "theme.dark": "Тёмная",
      "theme.light": "Светлая",
      "lang.ru": "РУС",
      "lang.en": "ENG",
    },
    en: {
      "nav.home": "Home",
      "nav.catalog": "Catalog",
      "nav.profile": "Profile",
      "nav.settings": "Settings",
      "settings.notifications": "Notifications",
      "settings.language": "Language",
      "settings.theme": "Theme",
      "settings.general": "General settings",
      "settings.account": "Account",
      "catalog.title": "Workout catalog",
      "catalog.create": "+ Create workout",
      "catalog.categories": "Categories",
      "catalog.search": "Search workouts",
      "btn.save": "Save",
      "btn.open": "Open",
      "btn.delete": "Delete",
      "on": "ON",
      "off": "OFF",
      "theme.dark": "Dark",
      "theme.light": "Light",
      "lang.ru": "RUS",
      "lang.en": "ENG",
    },
  };

  const DEFAULT_SETTINGS = { notifications: true, lang: "ru", theme: "dark" };

  function getSettings() {
    const s = read(KEYS.settings, { ...DEFAULT_SETTINGS });
    if (s.lang === "РУС") s.lang = "ru";
    if (s.lang === "ENG") s.lang = "en";
    if (s.theme === "Тёмная") s.theme = "dark";
    if (s.theme === "Светлая") s.theme = "light";
    return { ...DEFAULT_SETTINGS, ...s };
  }

  function saveSettings(s) {
    write(KEYS.settings, s);
  }

  function t(key) {
    const lang = getSettings().lang;
    return I18N[lang]?.[key] || I18N.ru[key] || key;
  }

  function getWorkoutImage(w) {
    if (w.image) return w.image;
    if (w.custom) return CUSTOM_WORKOUT_IMAGE;
    const def = DEFAULT_WORKOUTS.find((d) => d.id === w.id);
    return def?.image || CUSTOM_WORKOUT_IMAGE;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  }

  function applyLang(lang) {
    document.documentElement.lang = lang === "en" ? "en" : "ru";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const text = I18N[lang]?.[key];
      if (text) el.textContent = text;
    });
    const nav = document.querySelectorAll(".site-nav a");
    const keys = ["nav.home", "nav.catalog", "nav.profile", "nav.settings"];
    nav.forEach((a, i) => {
      if (keys[i] && I18N[lang]?.[keys[i]]) a.textContent = I18N[lang][keys[i]];
    });
    const createBtn = document.getElementById("btn-create-workout");
    if (createBtn) createBtn.textContent = t("catalog.create");
    const search = document.getElementById("search-input");
    if (search) search.placeholder = t("catalog.search");
  }

  function updateSettingsUI(s) {
    const notifEl = document.getElementById("val-notifications");
    const langEl = document.getElementById("val-lang");
    const themeEl = document.getElementById("val-theme");
    if (notifEl) notifEl.textContent = s.notifications ? t("on") : t("off");
    if (langEl) langEl.textContent = s.lang === "en" ? t("lang.en") : t("lang.ru");
    if (themeEl) themeEl.textContent = s.theme === "light" ? t("theme.light") : t("theme.dark");
  }

  function applyAllSettings() {
    const s = getSettings();
    applyTheme(s.theme);
    applyLang(s.lang);
    updateSettingsUI(s);
    return s;
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid() {
    return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function isValidEmail(email) {
    const e = String(email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(e)) return false;
    const domain = e.split("@")[1];
    if (!domain || !domain.includes(".")) return false;
    const tld = domain.split(".").pop();
    return tld.length >= 2;
  }

  function emailErrorMsg() {
    return getSettings().lang === "en"
      ? "Enter a valid email (e.g. name@mail.com)"
      : "Укажите корректный адрес эл. почты (например, name@mail.ru)";
  }

  function isLoggedInUser(session) {
    return session && !session.isGuest;
  }

  function readScopedStore(key) {
    const data = read(key, null);
    if (Array.isArray(data)) {
      write(key, {});
      return {};
    }
    return data && typeof data === "object" ? data : {};
  }

  function writeScopedStore(key, store) {
    write(key, store);
  }

  function getUsers() {
    return read(KEYS.users, []);
  }

  function saveUsers(users) {
    write(KEYS.users, users);
  }

  function getSession() {
    return read(KEYS.session, null);
  }

  function setSession(session) {
    if (session) write(KEYS.session, session);
    else localStorage.removeItem(KEYS.session);
  }

  function getCustomWorkouts() {
    return read(KEYS.customWorkouts, []);
  }

  function saveCustomWorkouts(list) {
    write(KEYS.customWorkouts, list);
  }

  function deleteCustomWorkout(workoutId, userId) {
    const list = getCustomWorkouts().filter((w) => w.id !== workoutId || w.userId !== userId);
    saveCustomWorkouts(list);
    setSavedIds(getSavedIds().filter((id) => id !== workoutId));
  }

  function getMyWorkouts(userId) {
    return getCustomWorkouts().filter((w) => w.userId === userId);
  }

  function getCustomWorkoutsForSession(session) {
    if (!session || session.isGuest) return [];
    return getCustomWorkouts().filter((w) => w.userId === session.userId);
  }

  function canDeleteWorkout(w, session) {
    return w.custom && session && !session.isGuest && w.userId === session.userId;
  }

  function updateUserProfile(userId, data) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, error: "Пользователь не найден" };

    const email = data.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      return { ok: false, error: emailErrorMsg() };
    }
    if (users.some((u, i) => i !== idx && u.email === email)) {
      return { ok: false, error: "Эта почта уже занята" };
    }

    users[idx].name = data.name.trim();
    users[idx].email = email;
    saveUsers(users);

    const session = getSession();
    if (session && session.userId === userId) {
      setSession({ ...session, name: users[idx].name });
    }
    return { ok: true, user: users[idx] };
  }

  function getAllWorkouts() {
    const session = getSession();
    return [...DEFAULT_WORKOUTS, ...getCustomWorkoutsForSession(session)];
  }

  function getSavedIds() {
    const session = getSession();
    if (!isLoggedInUser(session)) return [];
    const store = readScopedStore(KEYS.saved);
    return store[session.userId] || [];
  }

  function setSavedIds(ids) {
    const session = getSession();
    if (!isLoggedInUser(session)) return;
    const store = readScopedStore(KEYS.saved);
    store[session.userId] = ids;
    writeScopedStore(KEYS.saved, store);
  }

  function getHistory() {
    const session = getSession();
    if (!isLoggedInUser(session)) return [];
    const store = readScopedStore(KEYS.history);
    return store[session.userId] || [];
  }

  const WORKOUT_FINISH_COOLDOWN_MS = 15000;

  function addHistory(entry) {
    const session = getSession();
    if (!isLoggedInUser(session)) return false;
    const store = readScopedStore(KEYS.history);
    const list = store[session.userId] || [];
    const now = Date.now();
    const last = list[0];
    if (last && now - last.date < WORKOUT_FINISH_COOLDOWN_MS) return false;
    list.unshift({ ...entry, userId: session.userId });
    store[session.userId] = list.slice(0, 50);
    writeScopedStore(KEYS.history, store);
    return true;
  }

  function completeWorkout(w) {
    const session = getSession();
    if (!isLoggedInUser(session)) {
      return { ok: true, saved: false };
    }
    const added = addHistory({
      id: uid(),
      workoutId: w.id,
      title: w.title,
      duration: w.duration,
      date: Date.now(),
    });
    if (!added) {
      return { ok: false, error: "Тренировка уже засчитана. Подождите немного." };
    }
    const user = getUserById(session.userId);
    if (user) {
      user.stats.workouts += 1;
      user.stats.calories += Math.round(w.duration * 8);
      user.stats.minutes += w.duration;
      user.stats.streak += 1;
      updateUser(user);
    }
    return { ok: true, saved: true };
  }

  function getUserById(id) {
    return getUsers().find((u) => u.id === id);
  }

  function updateUser(user) {
    const users = getUsers().map((u) => (u.id === user.id ? user : u));
    saveUsers(users);
  }

  function toast(msg, isError) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.toggle("toast--error", !!isError);
    el.classList.add("is-visible");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  function register(name, email, password) {
    if (!isValidEmail(email)) {
      return { ok: false, error: emailErrorMsg() };
    }
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "Пользователь с такой почтой уже есть" };
    }
    const user = {
      id: uid(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      stats: { workouts: 0, calories: 0, minutes: 0, streak: 0 },
      createdAt: Date.now(),
    };
    users.push(user);
    saveUsers(users);
    setSession({ userId: user.id, name: user.name, isGuest: false });
    return { ok: true, user };
  }

  function login(email, password) {
    const value = String(email || "").trim();
    if (value.includes("@")) {
      if (!isValidEmail(value)) {
        return { ok: false, error: emailErrorMsg() };
      }
    }
    const user = getUsers().find(
      (u) => u.email === value.toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, error: "Неверная почта или пароль" };
    setSession({ userId: user.id, name: user.name, isGuest: false });
    return { ok: true, user };
  }

  function loginGuest() {
    setSession({ userId: "guest", name: "Гость", isGuest: true });
    return { ok: true };
  }

  function logout() {
    setSession(null);
  }

  function requireAuth(redirectGuest) {
    const s = getSession();
    if (!s) {
      window.location.href = "index.html";
      return null;
    }
    if (redirectGuest && s.isGuest) {
      toast("Войдите в аккаунт для этого действия", true);
      return null;
    }
    return s;
  }

  function renderWorkoutCard(w, session) {
    const saved = getSavedIds().includes(w.id);
    const custom = w.custom ? " workout-card--custom" : "";
    const deletable = canDeleteWorkout(w, session);
    const actionsClass = deletable ? " workout-card__actions--triple" : "";
    const deleteBtn = deletable
      ? `<button type="button" class="btn btn--danger btn-delete" data-id="${w.id}">Удалить</button>`
      : "";
    return `
      <article class="workout-card${custom}" data-id="${w.id}" data-category="${w.category}">
        <h3 class="workout-card__title">${escapeHtml(w.title)}</h3>
        <p class="workout-card__meta">${escapeHtml(w.type)} · ${w.duration} мин · ${escapeHtml(w.level)}</p>
        <div class="workout-card__preview"><img src="${escapeHtml(getWorkoutImage(w))}" alt="${escapeHtml(w.title)}"></div>
        <p class="workout-card__details">Уровень: ${escapeHtml(w.level)}<br>Длительность: ${w.duration} мин</p>
        <div class="workout-card__actions${actionsClass}">
          <a href="workout.html?id=${encodeURIComponent(w.id)}" class="btn btn--primary">Открыть</a>
          <button type="button" class="btn btn-save${saved ? " is-saved" : ""}" data-id="${w.id}">${saved ? "Сохранено" : "Сохранить"}</button>
          ${deleteBtn}
        </div>
      </article>`;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function initLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;
    if (getSession()) {
      window.location.href = "catalog.html";
      return;
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const loginValue = fd.get("login");
      if (String(loginValue).includes("@") && !isValidEmail(loginValue)) {
        showFormError(form, emailErrorMsg());
        return;
      }
      const res = login(loginValue, fd.get("password"));
      if (!res.ok) {
        showFormError(form, res.error);
        return;
      }
      toast("Добро пожаловать, " + res.user.name + "!");
      window.location.href = "catalog.html";
    });
    document.getElementById("guest-login")?.addEventListener("click", (e) => {
      e.preventDefault();
      loginGuest();
      toast("Вы вошли как гость");
      window.location.href = "catalog.html";
    });
  }

  function initRegister() {
    const form = document.getElementById("register-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const p1 = fd.get("password");
      const p2 = fd.get("password_confirm");
      if (p1 !== p2) {
        showFormError(form, "Пароли не совпадают");
        return;
      }
      const res = register(fd.get("name"), fd.get("email"), p1);
      if (!res.ok) {
        showFormError(form, res.error);
        return;
      }
      toast("Аккаунт создан!");
      window.location.href = "profile.html";
    });
  }

  function showFormError(form, msg) {
    let el = form.querySelector(".form-error");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-error";
      form.appendChild(el);
    }
    el.textContent = msg;
  }

  function initForgot() {
    const form = document.getElementById("forgot-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const contact = String(fd.get("contact") || "").trim();
      if (contact.includes("@") && !isValidEmail(contact)) {
        showFormError(form, emailErrorMsg());
        return;
      }
      toast("Код отправлен (демо). Проверьте почту.");
      setTimeout(() => { window.location.href = "index.html"; }, 1500);
    });
  }

  function initCatalog() {
    const grid = document.getElementById("workout-grid");
    if (!grid) return;

    let activeCategory = "Все";
    let searchQuery = "";

    function render() {
      let list = getAllWorkouts();
      if (activeCategory !== "Все") {
        list = list.filter((w) => w.category === activeCategory);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (w) =>
            w.title.toLowerCase().includes(q) ||
            w.type.toLowerCase().includes(q) ||
            w.level.toLowerCase().includes(q)
        );
      }
      const session = getSession();
      grid.innerHTML = list.length
        ? list.map((w) => renderWorkoutCard(w, session)).join("")
        : '<p class="panel__subtitle">Тренировки не найдены</p>';
      bindSaveButtons();
      bindDeleteButtons(render);
    }

    document.querySelectorAll(".sidebar-categories .list-cards__item").forEach((item) => {
      item.addEventListener("click", () => {
        document.querySelectorAll(".sidebar-categories .list-cards__item").forEach((el) => el.classList.remove("is-active"));
        item.classList.add("is-active");
        activeCategory = item.dataset.category || item.textContent.trim();
        render();
      });
    });

    document.getElementById("search-input")?.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      render();
    });

    document.getElementById("btn-create-workout")?.addEventListener("click", () => {
      if (!getSession() || getSession().isGuest) {
        toast("Создавать тренировки могут только зарегистрированные пользователи", true);
        return;
      }
      document.getElementById("modal-create")?.classList.add("is-open");
    });

    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("modal-cancel")?.addEventListener("click", closeModal);
    document.getElementById("modal-create")?.addEventListener("click", (e) => {
      if (e.target.id === "modal-create") closeModal();
    });

    document.getElementById("create-workout-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const w = {
        id: uid(),
        title: fd.get("title").trim(),
        category: fd.get("category"),
        type: fd.get("type").trim() || "Своя",
        duration: parseInt(fd.get("duration"), 10) || 30,
        level: fd.get("level"),
        custom: true,
        userId: getSession().userId,
        image: CUSTOM_WORKOUT_IMAGE,
      };
      if (!w.title) {
        toast("Введите название", true);
        return;
      }
      const list = getCustomWorkouts();
      list.push(w);
      write(KEYS.customWorkouts, list);
      closeModal();
      e.target.reset();
      toast("Тренировка «" + w.title + "» добавлена!");
      render();
    });

    render();
  }

  function closeModal() {
    document.getElementById("modal-create")?.classList.remove("is-open");
  }

  function bindSaveButtons() {
    document.querySelectorAll(".btn-save").forEach((btn) => {
      btn.onclick = () => {
        if (!isLoggedInUser(getSession())) {
          toast("Войдите в аккаунт, чтобы сохранять тренировки", true);
          return;
        }
        const id = btn.dataset.id;
        let ids = getSavedIds();
        if (ids.includes(id)) {
          ids = ids.filter((x) => x !== id);
          btn.textContent = "Сохранить";
          btn.classList.remove("is-saved");
          toast("Убрано из избранного");
        } else {
          ids.push(id);
          btn.textContent = "Сохранено";
          btn.classList.add("is-saved");
          toast("Сохранено в избранное");
        }
        setSavedIds(ids);
      };
    });
  }

  function bindDeleteButtons(onDeleted) {
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const session = getSession();
        const w = getCustomWorkoutsForSession(session).find((x) => x.id === id);
        if (!w) return;
        const title = w.title;
        if (!confirm('Удалить тренировку «' + title + '»?')) return;
        deleteCustomWorkout(id, session.userId);
        toast('Тренировка «' + title + '» удалена');
        if (typeof onDeleted === "function") onDeleted();
        if (document.body.dataset.page === "profile") renderMyWorkoutsList();
      };
    });
  }

  function renderMyWorkoutsList() {
    const section = document.getElementById("my-workouts-section");
    const listEl = document.getElementById("my-workouts-list");
    if (!section || !listEl) return;

    const session = getSession();
    if (!session || session.isGuest) {
      section.hidden = true;
      return;
    }

    const mine = getMyWorkouts(session.userId);
    section.hidden = mine.length === 0;
    if (!mine.length) {
      listEl.innerHTML = "";
      return;
    }

    listEl.innerHTML = mine
      .map(
        (w) => `
      <li class="list-cards__item my-workout-item">
        <div class="my-workout-item__info">
          <strong>${escapeHtml(w.title)}</strong>
          <p class="my-workout-item__meta">${escapeHtml(w.type)} · ${w.duration} мин · ${escapeHtml(w.level)}</p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <a href="workout.html?id=${encodeURIComponent(w.id)}" class="btn btn--primary" style="width:auto">Открыть</a>
          <button type="button" class="btn btn--danger btn-delete" data-id="${w.id}">Удалить</button>
        </div>
      </li>`
      )
      .join("");

    bindDeleteButtons();
  }

  function openEditProfileModal(user) {
    const modal = document.getElementById("modal-edit-profile");
    if (!modal || !user) return;
    document.getElementById("edit-name").value = user.name;
    document.getElementById("edit-email").value = user.email;
    modal.classList.add("is-open");
  }

  function closeEditProfileModal() {
    document.getElementById("modal-edit-profile")?.classList.remove("is-open");
  }

  const MONTH_NAMES_RU = [
    "январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
  ];

  const ACHIEVEMENTS = [
    { id: "first_workout", icon: "🏁", title: "Первый шаг", desc: "1 тренировка", check: (c) => c.stats.workouts >= 1 },
    { id: "five_workouts", icon: "💪", title: "В ритме", desc: "5 тренировок", check: (c) => c.stats.workouts >= 5 },
    { id: "ten_workouts", icon: "🔥", title: "Железный характер", desc: "10 тренировок", check: (c) => c.stats.workouts >= 10 },
    { id: "calories_100", icon: "⚡", title: "Энергия", desc: "100 ккал", check: (c) => c.stats.calories >= 100 },
    { id: "calories_500", icon: "🌟", title: "Марафонец", desc: "500 ккал", check: (c) => c.stats.calories >= 500 },
    { id: "minutes_60", icon: "⏱", title: "Час силы", desc: "60 минут", check: (c) => c.stats.minutes >= 60 },
    { id: "minutes_300", icon: "🏆", title: "Пятёрка часов", desc: "300 минут", check: (c) => c.stats.minutes >= 300 },
    { id: "streak_3", icon: "📅", title: "Три дня", desc: "Серия 3 дня", check: (c) => c.stats.streak >= 3 },
    { id: "month_3", icon: "📊", title: "Активный месяц", desc: "3 тренировки в месяце", check: (c) => c.monthWorkouts >= 3 },
    { id: "month_10", icon: "🎯", title: "Цель месяца", desc: "10 тренировок в месяце", check: (c) => c.monthWorkouts >= 10 },
  ];

  function buildProfileContext(user, history) {
    const stats = user?.stats || { workouts: 0, calories: 0, minutes: 0, streak: 0 };
    const now = new Date();
    const monthHistory = history.filter((h) => {
      const d = new Date(h.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      stats,
      history,
      monthWorkouts: monthHistory.length,
      monthMinutes: monthHistory.reduce((sum, h) => sum + (h.duration || 0), 0),
    };
  }

  function getMonthlyBuckets(history) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const buckets = Array.from({ length: daysInMonth }, () => ({ count: 0, minutes: 0 }));

    history.forEach((h) => {
      const d = new Date(h.date);
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const idx = d.getDate() - 1;
      buckets[idx].count += 1;
      buckets[idx].minutes += h.duration || 0;
    });

    return { buckets, year, month, daysInMonth };
  }

  function formatShortDate(ts) {
    return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  }

  function renderMonthlyActivity(history, isGuest) {
    const el = document.getElementById("activity-chart");
    if (!el) return;

    if (isGuest) {
      el.innerHTML = '<p class="activity-chart__empty">Войдите в аккаунт, чтобы видеть активность за месяц</p>';
      return;
    }

    const { buckets, year, month, daysInMonth } = getMonthlyBuckets(history);
    const totalWorkouts = buckets.reduce((s, b) => s + b.count, 0);
    const totalMinutes = buckets.reduce((s, b) => s + b.minutes, 0);
    const maxMinutes = Math.max(1, ...buckets.map((b) => b.minutes));

    if (!totalWorkouts) {
      el.innerHTML =
        '<div class="activity-chart__head"><span class="activity-chart__title">Активность за ' +
        escapeHtml(MONTH_NAMES_RU[month]) +
        '</span></div><p class="activity-chart__empty">В этом месяце пока нет тренировок. Завершите тренировку в каталоге.</p>';
      return;
    }

    const bars = buckets
      .map((b, i) => {
        const day = i + 1;
        const height = b.minutes ? Math.max(8, Math.round((b.minutes / maxMinutes) * 100)) : 4;
        const active = b.count > 0 ? " activity-bar__fill--active" : "";
        const showLabel = day === 1 || day % 5 === 0 || day === daysInMonth;
        const label = showLabel ? `<span class="activity-bar__label">${day}</span>` : '<span class="activity-bar__label" aria-hidden="true">&nbsp;</span>';
        const title = b.count
          ? day + " " + MONTH_NAMES_RU[month] + ": " + b.count + " тр., " + b.minutes + " мин"
          : day + " " + MONTH_NAMES_RU[month];
        return (
          '<div class="activity-bar" title="' +
          escapeHtml(title) +
          '"><div class="activity-bar__fill' +
          active +
          '" style="height:' +
          height +
          '%"></div>' +
          label +
          "</div>"
        );
      })
      .join("");

    el.innerHTML =
      '<div class="activity-chart__head">' +
      '<span class="activity-chart__title">Активность за ' +
      escapeHtml(MONTH_NAMES_RU[month]) +
      " " +
      year +
      "</span>" +
      '<span class="activity-chart__summary">' +
      totalWorkouts +
      " тр. · " +
      totalMinutes +
      " мин</span>" +
      "</div>" +
      '<div class="activity-chart__bars">' +
      bars +
      "</div>";
  }

  function renderAchievements(user, history, isGuest) {
    const grid = document.getElementById("achievements-grid");
    const feed = document.getElementById("achievements-feed");
    if (!grid || !feed) return;

    if (isGuest) {
      grid.innerHTML =
        '<p class="activity-chart__empty" style="grid-column:1/-1">Достижения доступны после регистрации</p>';
      feed.innerHTML = '<li class="achievements-feed__empty">Завершайте тренировки — награды появятся здесь</li>';
      return;
    }

    const ctx = buildProfileContext(user, history);
    const unlocked = ACHIEVEMENTS.filter((a) => a.check(ctx));

    grid.innerHTML = ACHIEVEMENTS.map((a) => {
      const ok = a.check(ctx);
      return (
        '<div class="award-box' +
        (ok ? " award-box--unlocked" : " award-box--locked") +
        '" title="' +
        escapeHtml(a.desc) +
        '">' +
        '<span class="award-box__icon">' +
        a.icon +
        "</span>" +
        '<span class="award-box__title">' +
        escapeHtml(a.title) +
        "</span>" +
        '<span class="award-box__desc">' +
        escapeHtml(a.desc) +
        "</span>" +
        "</div>"
      );
    }).join("");

    if (!unlocked.length) {
      feed.innerHTML =
        '<li class="achievements-feed__empty">Пока нет достижений — завершите первую тренировку</li>';
      return;
    }

    feed.innerHTML = unlocked
      .map((a) => ({ a, date: guessAchievementDate(a.id, history, ctx) }))
      .sort((x, y) => (y.date || 0) - (x.date || 0))
      .map(
        ({ a, date }) =>
          '<li class="achievements-feed__item">' +
          "<span><strong>" +
          escapeHtml(a.title) +
          "</strong> — " +
          escapeHtml(a.desc) +
          "</span>" +
          '<span class="achievements-feed__date">' +
          (date ? formatShortDate(date) : "получено") +
          "</span>" +
          "</li>"
      )
      .join("");
  }

  function guessAchievementDate(achievementId, history, ctx) {
    const sorted = [...history].sort((a, b) => a.date - b.date);
    if (achievementId === "first_workout" && sorted[0]) return sorted[0].date;
    if (achievementId === "five_workouts" && sorted[4]) return sorted[4].date;
    if (achievementId === "ten_workouts" && sorted[9]) return sorted[9].date;
    if (achievementId.startsWith("month_")) {
      const now = new Date();
      const monthItems = sorted.filter((h) => {
        const d = new Date(h.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const need = achievementId === "month_10" ? 10 : 3;
      if (monthItems[need - 1]) return monthItems[need - 1].date;
    }
    if (sorted.length) return sorted[sorted.length - 1].date;
    return null;
  }

  function initWorkout() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "w4";
    const all = getAllWorkouts();
    const w = all.find((x) => x.id === id) || DEFAULT_WORKOUTS.find((x) => x.id === id) || DEFAULT_WORKOUTS[0];
    document.getElementById("workout-title") && (document.getElementById("workout-title").textContent = w.title);
    document.getElementById("workout-subtitle") && (document.getElementById("workout-subtitle").textContent = w.type + " · " + w.duration + " мин");

    const preview = document.getElementById("workout-preview");
    if (preview) {
      const imgSrc = getWorkoutImage(w);
      preview.innerHTML = '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(w.title) + '">';
    }

    const steps = ["Разминка", "Основной блок", "Заминка", "Растяжка"];
    let stepIndex = 0;
    let setCount = 0;

    const stepEl = document.getElementById("step-value");
    const setsEl = document.getElementById("sets-value");

    function updateWorkoutStats() {
      if (stepEl) stepEl.textContent = stepIndex + 1 + " / " + steps.length;
      if (setsEl) setsEl.textContent = String(setCount);
    }

    function renderSteps() {
      const list = document.getElementById("workout-steps");
      if (!list) return;
      list.innerHTML = steps
        .map((name, i) => {
          const active = i === stepIndex;
          if (active) {
            return `<li class="list-cards__item list-cards__item--active">
              <span class="list-cards__item-row">
                <span>${escapeHtml(name)}</span>
                <span class="badge">Сейчас</span>
              </span>
            </li>`;
          }
          return `<li class="list-cards__item">${escapeHtml(name)}</li>`;
        })
        .join("");
      const subtitle = document.getElementById("workout-subtitle");
      if (subtitle) {
        const setLabel = setCount > 0 ? "Подход " + setCount + " · " : "";
        subtitle.textContent = setLabel + steps[stepIndex] + " · " + w.type + " · " + w.duration + " мин";
      }
      updateWorkoutStats();
    }

    renderSteps();

    let isFinishing = false;
    let lastStepAdvanceAt = 0;

    let seconds = 0;
    let running = true;
    const timerEl = document.getElementById("timer-value");
    const interval = setInterval(() => {
      if (!running) return;
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      if (timerEl) timerEl.textContent = m + ":" + s;
    }, 1000);

    document.getElementById("btn-pause")?.addEventListener("click", function () {
      running = !running;
      this.textContent = running ? "Пауза" : "Продолжить";
    });

    document.getElementById("btn-next")?.addEventListener("click", () => {
      if (isFinishing) return;
      const now = Date.now();
      if (now - lastStepAdvanceAt < 450) return;
      lastStepAdvanceAt = now;

      if (stepIndex < steps.length - 1) {
        stepIndex += 1;
        renderSteps();
        toast("Этап: " + steps[stepIndex]);
        return;
      }

      setCount += 1;
      stepIndex = 0;
      renderSteps();
      toast("Подход " + setCount + " завершён · снова " + steps[0]);
    });

    document.getElementById("btn-finish")?.addEventListener("click", function () {
      if (isFinishing) return;
      isFinishing = true;
      this.disabled = true;
      document.getElementById("btn-next")?.setAttribute("disabled", "disabled");
      document.getElementById("btn-pause")?.setAttribute("disabled", "disabled");

      clearInterval(interval);
      const res = completeWorkout(w);
      if (!res.ok) {
        isFinishing = false;
        this.disabled = false;
        document.getElementById("btn-next")?.removeAttribute("disabled");
        document.getElementById("btn-pause")?.removeAttribute("disabled");
        toast(res.error, true);
        return;
      }

      this.textContent = "Сохранение…";
      toast(
        res.saved
          ? "Тренировка завершена! +" + w.duration + " мин"
          : "Тренировка завершена"
      );
      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1200);
    });
  }

  function initProfile() {
    const session = getSession();
    if (!session) {
      window.location.href = "index.html";
      return;
    }

    const nameEl = document.getElementById("profile-name");
    const statusEl = document.getElementById("profile-status");
    const emailEl = document.getElementById("profile-email");
    const editBtn = document.getElementById("btn-edit-profile");
    let user = null;

    if (!session.isGuest) {
      user = getUserById(session.userId);
      if (editBtn) editBtn.hidden = false;
      if (emailEl && user) {
        emailEl.hidden = false;
        emailEl.textContent = user.email;
      }
    } else if (editBtn) {
      editBtn.hidden = true;
    }

    if (nameEl) nameEl.textContent = session.name;
    if (statusEl) statusEl.textContent = session.isGuest ? "Статус: гость" : "Статус: активный";

    const avatar = document.getElementById("profile-avatar");
    if (avatar) {
      avatar.innerHTML = '<img src="assets/logo.svg" alt="Аватар">';
    }

    let stats = { workouts: 0, calories: 0, minutes: 0, streak: 0 };
    if (user) stats = user.stats;

    const map = { workouts: stats.workouts, calories: stats.calories, minutes: stats.minutes + " мин", streak: stats.streak };
    Object.keys(map).forEach((k) => {
      const el = document.getElementById("stat-" + k);
      if (el) el.textContent = map[k];
    });

    const histEl = document.getElementById("history-list");
    if (histEl) {
      const hist = session.isGuest ? [] : getHistory();
      histEl.innerHTML = hist.length
        ? hist.slice(0, 8).map((h) => `<li class="list-cards__item history-item"><span>${escapeHtml(h.title)} / ${h.duration} мин</span><span>Завершено</span></li>`).join("")
        : '<li class="list-cards__item">' + (session.isGuest ? "История доступна после регистрации" : "Пока нет завершённых тренировок") + "</li>";
    }

    renderMyWorkoutsList();

    const history = session.isGuest ? [] : getHistory();
    renderMonthlyActivity(history, session.isGuest);
    renderAchievements(user, history, session.isGuest);

    editBtn?.addEventListener("click", () => {
      if (user) openEditProfileModal(user);
    });

    document.getElementById("edit-profile-cancel")?.addEventListener("click", closeEditProfileModal);
    document.getElementById("modal-edit-profile")?.addEventListener("click", (e) => {
      if (e.target.id === "modal-edit-profile") closeEditProfileModal();
    });

    document.getElementById("edit-profile-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!user) return;
      const fd = new FormData(e.target);
      const email = fd.get("email");
      if (!isValidEmail(email)) {
        toast(emailErrorMsg(), true);
        return;
      }
      const res = updateUserProfile(user.id, {
        name: fd.get("name"),
        email,
      });
      if (!res.ok) {
        toast(res.error, true);
        return;
      }
      user = res.user;
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      closeEditProfileModal();
      toast("Профиль обновлён");
    });

    if (new URLSearchParams(location.search).get("edit") === "1" && user) {
      openEditProfileModal(user);
    }
  }

  function initSettings() {
    let s = applyAllSettings();
    const session = getSession();
    const loggedIn = isLoggedInUser(session);
    const accountPanel = document.getElementById("settings-account-panel");
    const guestHint = document.getElementById("settings-guest-hint");
    if (accountPanel) accountPanel.hidden = !loggedIn;
    if (guestHint) guestHint.hidden = loggedIn;

    function persist() {
      saveSettings(s);
      applyTheme(s.theme);
      applyLang(s.lang);
      updateSettingsUI(s);
    }

    document.getElementById("toggle-notifications")?.addEventListener("click", () => {
      s.notifications = !s.notifications;
      persist();
      toast(s.notifications ? (s.lang === "en" ? "Notifications on" : "Уведомления включены") : (s.lang === "en" ? "Notifications off" : "Уведомления выключены"));
    });

    document.getElementById("toggle-lang")?.addEventListener("click", () => {
      s.lang = s.lang === "en" ? "ru" : "en";
      persist();
      toast(s.lang === "en" ? "Language: English" : "Язык: русский");
    });

    document.getElementById("toggle-theme")?.addEventListener("click", () => {
      s.theme = s.theme === "light" ? "dark" : "light";
      persist();
      toast(s.theme === "light" ? (s.lang === "en" ? "Light theme" : "Светлая тема") : (s.lang === "en" ? "Dark theme" : "Тёмная тема"));
    });

    document.getElementById("btn-save-settings")?.addEventListener("click", () => {
      persist();
      toast(s.lang === "en" ? "Settings saved" : "Настройки сохранены");
    });

    document.getElementById("btn-logout")?.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
      toast(s.lang === "en" ? "Logged out" : "Вы вышли из аккаунта");
      window.location.href = "index.html";
    });
  }

  function initGlobal() {
    applyAllSettings();

    document.querySelectorAll(".sidebar-categories .list-cards__item").forEach((item, i) => {
      if (!item.dataset.category) item.dataset.category = CATEGORIES[i + 1] || item.textContent.trim();
    });
    const firstCat = document.querySelector('.sidebar-categories .list-cards__item[data-category="Все"]');
    if (firstCat) firstCat.dataset.category = "Все";
  }

  document.addEventListener("DOMContentLoaded", () => {
    initGlobal();
    const page = document.body.dataset.page;
    if (page === "login") initLogin();
    else if (page === "register") initRegister();
    else if (page === "forgot") initForgot();
    else if (page === "catalog") initCatalog();
    else if (page === "workout") initWorkout();
    else if (page === "profile") initProfile();
    else if (page === "settings") initSettings();
  });
})();
