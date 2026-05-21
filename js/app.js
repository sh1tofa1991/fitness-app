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
    { id: "w1", title: "Всё тело 45", category: "Силовые", type: "Силовая", duration: 45, level: "средний", image: "assets/workouts/w1.svg" },
    { id: "w2", title: "Утренняя мобильность", category: "Растяжка", type: "Мобилити", duration: 20, level: "лёгкий", image: "assets/workouts/w2.svg" },
    { id: "w3", title: "Кор и пресс", category: "Силовые", type: "Кор и пресс", duration: 25, level: "средний", image: "assets/workouts/w3.svg" },
    { id: "w4", title: "Интервалы 20", category: "Кардио", type: "Интервалы", duration: 20, level: "высокий", image: "assets/workouts/w4.svg" },
    { id: "w5", title: "День ног", category: "Силовые", type: "Ноги", duration: 50, level: "продвинутый", image: "assets/workouts/w5.svg" },
    { id: "w6", title: "Растяжка-разгрузка", category: "Растяжка", type: "Растяжка", duration: 15, level: "лёгкий", image: "assets/workouts/w6.svg" },
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

  function deleteCustomWorkout(workoutId) {
    const list = getCustomWorkouts().filter((w) => w.id !== workoutId);
    saveCustomWorkouts(list);
    setSavedIds(getSavedIds().filter((id) => id !== workoutId));
  }

  function getMyWorkouts(userId) {
    return getCustomWorkouts().filter((w) => w.userId === userId);
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
    return [...DEFAULT_WORKOUTS, ...getCustomWorkouts()];
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

  function addHistory(entry) {
    const session = getSession();
    if (!isLoggedInUser(session)) return;
    const store = readScopedStore(KEYS.history);
    const list = store[session.userId] || [];
    list.unshift({ ...entry, userId: session.userId });
    store[session.userId] = list.slice(0, 50);
    writeScopedStore(KEYS.history, store);
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
        const w = getCustomWorkouts().find((x) => x.id === id);
        if (!w) return;
        const title = w.title;
        if (!confirm('Удалить тренировку «' + title + '»?')) return;
        deleteCustomWorkout(id);
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

  function initWorkout() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "w4";
    const all = getAllWorkouts();
    const w = all.find((x) => x.id === id) || all[0];
    document.getElementById("workout-title") && (document.getElementById("workout-title").textContent = w.title);
    document.getElementById("workout-subtitle") && (document.getElementById("workout-subtitle").textContent = w.type + " · " + w.duration + " мин");

    const preview = document.getElementById("workout-preview");
    if (preview) {
      const imgSrc = getWorkoutImage(w);
      preview.innerHTML = '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(w.title) + '">';
    }

    const steps = ["Разминка", "Основной блок", "Заминка", "Растяжка"];
    const REPS_TARGET = 20;
    const SETS_TARGET = 4;
    let stepIndex = 0;
    let round = 1;
    let rep = 0;
    let set = 1;

    const repsEl = document.getElementById("reps-value");
    const setsEl = document.getElementById("sets-value");
    const roundHint = document.getElementById("workout-round-hint");

    function updateWorkoutStats() {
      if (repsEl) repsEl.textContent = rep + " / " + REPS_TARGET;
      if (setsEl) setsEl.textContent = set + " / " + SETS_TARGET;
      if (roundHint) roundHint.textContent = "Круг " + round;
    }

    function resetSetRep() {
      rep = 0;
      set = 1;
      updateWorkoutStats();
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
        subtitle.textContent =
          "Круг " + round + " · " + steps[stepIndex] + " · " + w.type + " · " + w.duration + " мин";
      }
      updateWorkoutStats();
    }

    renderSteps();

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
      if (rep < REPS_TARGET) {
        rep += 1;
        updateWorkoutStats();
        if (rep === REPS_TARGET) toast("Подход " + set + ": все повторения");
        return;
      }

      if (set < SETS_TARGET) {
        set += 1;
        rep = 0;
        updateWorkoutStats();
        toast("Подход " + set + " из " + SETS_TARGET);
        return;
      }

      if (stepIndex < steps.length - 1) {
        stepIndex += 1;
        resetSetRep();
        renderSteps();
        toast("Этап: " + steps[stepIndex]);
        return;
      }

      round += 1;
      stepIndex = 0;
      resetSetRep();
      renderSteps();
      toast("Новый круг " + round + " — " + steps[0]);
    });

    document.getElementById("btn-finish")?.addEventListener("click", () => {
      clearInterval(interval);
      const session = getSession();
      if (session && !session.isGuest) {
        const user = getUserById(session.userId);
        if (user) {
          user.stats.workouts += 1;
          user.stats.calories += Math.round(w.duration * 8);
          user.stats.minutes += w.duration;
          user.stats.streak += 1;
          updateUser(user);
        }
      }
      addHistory({
        id: uid(),
        title: w.title,
        duration: w.duration,
        date: Date.now(),
      });
      toast("Тренировка завершена! +" + w.duration + " мин");
      setTimeout(() => { window.location.href = "profile.html"; }, 1200);
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
      avatar.innerHTML = '<img src="assets/logo.png" alt="Аватар">';
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
