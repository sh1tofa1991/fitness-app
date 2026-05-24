/**
 * COOLBOYDRACO GYM — клиент (localStorage)
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
  const WORKOUT_STEPS = ["Разминка", "Основной блок", "Заминка", "Растяжка"];
  const WORKOUT_FINISH_COOLDOWN_MS = 15000;
  const MONTH_NAMES_RU = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const EMAIL_ERROR = "Укажите корректный адрес эл. почты (например, name@mail.ru)";
  const DEFAULT_SETTINGS = { notifications: true, theme: "dark" };

  const ACHIEVEMENTS = [
    { id: "first_workout", icon: "flag", title: "Первый шаг", desc: "1 тренировка", need: (c) => c.stats.workouts >= 1 },
    { id: "five_workouts", icon: "dumbbell", title: "В ритме", desc: "5 тренировок", need: (c) => c.stats.workouts >= 5 },
    { id: "ten_workouts", icon: "flame", title: "Железный характер", desc: "10 тренировок", need: (c) => c.stats.workouts >= 10 },
    { id: "calories_100", icon: "zap", title: "Энергия", desc: "100 ккал", need: (c) => c.stats.calories >= 100 },
    { id: "calories_500", icon: "star", title: "Марафонец", desc: "500 ккал", need: (c) => c.stats.calories >= 500 },
    { id: "minutes_60", icon: "clock", title: "Час силы", desc: "60 минут", need: (c) => c.stats.minutes >= 60 },
    { id: "minutes_300", icon: "trophy", title: "Пятёрка часов", desc: "300 минут", need: (c) => c.stats.minutes >= 300 },
    { id: "streak_3", icon: "calendar", title: "Три дня", desc: "Серия 3 дня", need: (c) => c.stats.streak >= 3 },
    { id: "month_3", icon: "chart-column", title: "Активный месяц", desc: "3 тренировки в месяце", need: (c) => c.monthWorkouts >= 3 },
    { id: "month_10", icon: "target", title: "Цель месяца", desc: "10 тренировок в месяце", need: (c) => c.monthWorkouts >= 10 },
  ];

  const PAGE_INIT = {
    login: initLogin,
    register: initRegister,
    forgot: initForgot,
    catalog: initCatalog,
    workout: initWorkout,
    profile: initProfile,
    settings: initSettings,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function getPage() {
    return document.body.dataset.page || document.documentElement.dataset.page;
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

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function achievementIcon(name, sizeClass) {
    const cls = "ui-icon" + (sizeClass ? " " + sizeClass : "");
    return typeof GymLucide !== "undefined" ? GymLucide.html(name, cls) : "";
  }

  function go(url, delayMs) {
    if (delayMs) setTimeout(() => { location.href = url; }, delayMs);
    else location.href = url;
  }

  function isRegistered(session) {
    return session && !session.isGuest;
  }

  function getSession() {
    return read(KEYS.session, null);
  }

  function setSession(session) {
    if (session) write(KEYS.session, session);
    else localStorage.removeItem(KEYS.session);
  }

  function readScopedStore(key) {
    const data = read(key, null);
    if (Array.isArray(data)) {
      write(key, {});
      return {};
    }
    return data && typeof data === "object" ? data : {};
  }

  function readUserStore(key) {
    const session = getSession();
    if (!isRegistered(session)) return [];
    const store = readScopedStore(key);
    return store[session.userId] || [];
  }

  function writeUserStore(key, list) {
    const session = getSession();
    if (!isRegistered(session)) return;
    const store = readScopedStore(key);
    store[session.userId] = list;
    write(key, store);
  }

  function getSettings() {
    const s = read(KEYS.settings, { ...DEFAULT_SETTINGS });
    if (s.theme === "Тёмная") s.theme = "dark";
    if (s.theme === "Светлая") s.theme = "light";
    const { notifications, theme } = { ...DEFAULT_SETTINGS, ...s };
    return { notifications, theme };
  }

  function saveSettings(s) {
    write(KEYS.settings, { notifications: s.notifications, theme: s.theme });
  }

  function toast(msg, isError) {
    let el = $("toast");
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

  function showFormError(form, msg) {
    let el = form.querySelector(".form-error");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-error";
      form.appendChild(el);
    }
    el.textContent = msg;
  }

  function isValidEmail(email) {
    const e = String(email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(e)) return false;
    const tld = e.split("@")[1]?.split(".").pop();
    return !!tld && tld.length >= 2;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  }

  function updateSettingsUI(s) {
    const map = {
      "val-notifications": s.notifications ? "ВКЛ" : "ВЫКЛ",
      "val-theme": s.theme === "light" ? "Светлая" : "Тёмная",
    };
    Object.entries(map).forEach(([id, text]) => {
      const el = $(id);
      if (el) el.textContent = text;
    });
  }

  function applyAllSettings() {
    const s = getSettings();
    applyTheme(s.theme);
    updateSettingsUI(s);
    return s;
  }

  function getUsers() {
    return read(KEYS.users, []);
  }

  function saveUsers(users) {
    write(KEYS.users, users);
  }

  function getUserById(id) {
    return getUsers().find((u) => u.id === id);
  }

  function updateUser(user) {
    saveUsers(getUsers().map((u) => (u.id === user.id ? user : u)));
  }

  function getCustomWorkouts() {
    return read(KEYS.customWorkouts, []);
  }

  function saveCustomWorkouts(list) {
    write(KEYS.customWorkouts, list);
  }

  function getUserCustomWorkouts(session) {
    if (!isRegistered(session)) return [];
    return getCustomWorkouts().filter((w) => w.userId === session.userId);
  }

  function getAllWorkouts() {
    return [...DEFAULT_WORKOUTS, ...getUserCustomWorkouts(getSession())];
  }

  function findWorkout(id) {
    return getAllWorkouts().find((w) => w.id === id) || DEFAULT_WORKOUTS.find((w) => w.id === id);
  }

  function getWorkoutImage(w) {
    return w.image || (w.custom ? CUSTOM_WORKOUT_IMAGE : DEFAULT_WORKOUTS.find((d) => d.id === w.id)?.image) || CUSTOM_WORKOUT_IMAGE;
  }

  function canDeleteWorkout(w, session) {
    return w.custom && isRegistered(session) && w.userId === session.userId;
  }

  function deleteCustomWorkout(workoutId, userId) {
    saveCustomWorkouts(getCustomWorkouts().filter((w) => w.id !== workoutId || w.userId !== userId));
    writeUserStore(KEYS.saved, readUserStore(KEYS.saved).filter((id) => id !== workoutId));
  }

  function getSavedIds() {
    return readUserStore(KEYS.saved);
  }

  function setSavedIds(ids) {
    writeUserStore(KEYS.saved, ids);
  }

  function getHistory() {
    return readUserStore(KEYS.history);
  }

  function addHistory(entry) {
    const session = getSession();
    if (!isRegistered(session)) return false;
    const list = getHistory();
    const now = Date.now();
    if (list[0] && now - list[0].date < WORKOUT_FINISH_COOLDOWN_MS) return false;
    list.unshift({ ...entry, userId: session.userId });
    writeUserStore(KEYS.history, list.slice(0, 50));
    return true;
  }

  function completeWorkout(w) {
    if (!isRegistered(getSession())) return { ok: true, saved: false };
    if (!addHistory({ id: uid(), workoutId: w.id, title: w.title, duration: w.duration, date: Date.now() })) {
      return { ok: false, error: "Тренировка уже засчитана. Подождите немного." };
    }
    const user = getUserById(getSession().userId);
    if (user) {
      user.stats.workouts += 1;
      user.stats.calories += Math.round(w.duration * 8);
      user.stats.minutes += w.duration;
      user.stats.streak += 1;
      updateUser(user);
    }
    return { ok: true, saved: true };
  }

  function register(name, email, password) {
    if (!isValidEmail(email)) return { ok: false, error: EMAIL_ERROR };
    const users = getUsers();
    const norm = email.trim().toLowerCase();
    if (users.some((u) => u.email === norm)) return { ok: false, error: "Пользователь с такой почтой уже есть" };
    const user = {
      id: uid(),
      name: name.trim(),
      email: norm,
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
    if (value.includes("@") && !isValidEmail(value)) return { ok: false, error: EMAIL_ERROR };
    const user = getUsers().find((u) => u.email === value.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: "Неверная почта или пароль" };
    setSession({ userId: user.id, name: user.name, isGuest: false });
    return { ok: true, user };
  }

  function loginGuest() {
    setSession({ userId: "guest", name: "Гость", isGuest: true });
  }

  function logout() {
    setSession(null);
  }

  function updateUserProfile(userId, data) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, error: "Пользователь не найден" };
    const email = data.email.trim().toLowerCase();
    if (!isValidEmail(email)) return { ok: false, error: EMAIL_ERROR };
    if (users.some((u, i) => i !== idx && u.email === email)) return { ok: false, error: "Эта почта уже занята" };
    users[idx].name = data.name.trim();
    users[idx].email = email;
    saveUsers(users);
    const session = getSession();
    if (session?.userId === userId) setSession({ ...session, name: users[idx].name });
    return { ok: true, user: users[idx] };
  }

  function renderWorkoutCard(w, session) {
    const saved = getSavedIds().includes(w.id);
    const deletable = canDeleteWorkout(w, session);
    return `
      <article class="workout-card${w.custom ? " workout-card--custom" : ""}" data-id="${w.id}" data-category="${w.category}">
        <h3 class="workout-card__title">${escapeHtml(w.title)}</h3>
        <p class="workout-card__meta">${escapeHtml(w.type)} · ${w.duration} мин · ${escapeHtml(w.level)}</p>
        <div class="workout-card__preview"><img src="${escapeHtml(getWorkoutImage(w))}" alt="${escapeHtml(w.title)}"></div>
        <p class="workout-card__details">Уровень: ${escapeHtml(w.level)}<br>Длительность: ${w.duration} мин</p>
        <div class="workout-card__actions${deletable ? " workout-card__actions--triple" : ""}">
          <a href="workout.html?id=${encodeURIComponent(w.id)}" class="btn btn--primary">Открыть</a>
          <button type="button" class="btn btn-save${saved ? " is-saved" : ""}" data-id="${w.id}">${saved ? "Сохранено" : "Сохранить"}</button>
          ${deletable ? `<button type="button" class="btn btn--danger btn-delete" data-id="${w.id}">Удалить</button>` : ""}
        </div>
      </article>`;
  }

  function bindSaveButtons() {
    document.querySelectorAll(".btn-save").forEach((btn) => {
      btn.onclick = () => {
        if (!isRegistered(getSession())) {
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
        const session = getSession();
        const w = getUserCustomWorkouts(session).find((x) => x.id === btn.dataset.id);
        if (!w || !confirm('Удалить тренировку «' + w.title + '»?')) return;
        deleteCustomWorkout(w.id, session.userId);
        toast('Тренировка «' + w.title + '» удалена');
        if (onDeleted) onDeleted();
        if (getPage() === "profile") renderMyWorkoutsList();
      };
    });
  }

  function setModalOpen(id, open) {
    $(id)?.classList.toggle("is-open", open);
  }

  function initLogin() {
    const form = $("login-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const loginValue = fd.get("login");
      if (String(loginValue).includes("@") && !isValidEmail(loginValue)) {
        showFormError(form, EMAIL_ERROR);
        return;
      }
      const res = login(loginValue, fd.get("password"));
      if (!res.ok) return showFormError(form, res.error);
      toast("Добро пожаловать, " + res.user.name + "!");
      go("catalog.html");
    });
    $("guest-login")?.addEventListener("click", (e) => {
      e.preventDefault();
      loginGuest();
      toast("Вы вошли как гость");
      go("catalog.html");
    });
  }

  function initRegister() {
    const form = $("register-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if (fd.get("password") !== fd.get("password_confirm")) {
        showFormError(form, "Пароли не совпадают");
        return;
      }
      const res = register(fd.get("name"), fd.get("email"), fd.get("password"));
      if (!res.ok) return showFormError(form, res.error);
      toast("Аккаунт создан!");
      go("profile.html");
    });
  }

  function initForgot() {
    const form = $("forgot-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const contact = String(new FormData(form).get("contact") || "").trim();
      if (contact.includes("@") && !isValidEmail(contact)) {
        showFormError(form, EMAIL_ERROR);
        return;
      }
      toast("Код отправлен (демо). Проверьте почту.");
      go("index.html", 1500);
    });
  }

  const FILTER_GOAL = [
    { label: "Цель", match: null },
    { label: "Сила", match: (w) => w.category === "Силовые" },
    { label: "Кардио", match: (w) => w.category === "Кардио" },
    { label: "Гибкость", match: (w) => ["Растяжка", "Йога"].includes(w.category) },
    { label: "Дом / зал", match: (w) => ["Для дома", "Для зала"].includes(w.category) },
  ];

  const FILTER_LEVEL = [
    { label: "Уровень", value: null },
    { label: "лёгкий", value: "лёгкий" },
    { label: "средний", value: "средний" },
    { label: "высокий", value: "высокий" },
    { label: "продвинутый", value: "продвинутый" },
  ];

  const FILTER_DURATION = [
    { label: "Длительность", match: null },
    { label: "до 20 мин", match: (w) => w.duration <= 20 },
    { label: "21–40 мин", match: (w) => w.duration > 20 && w.duration <= 40 },
    { label: "40+ мин", match: (w) => w.duration > 40 },
  ];

  function initCatalog() {
    const grid = $("workout-grid");
    if (!grid) return;

    let activeCategory = "Все";
    let searchQuery = "";
    const chipState = { goal: 0, level: 0, duration: 0 };

    function applyChipFilters(list) {
      const goalFn = FILTER_GOAL[chipState.goal].match;
      const levelVal = FILTER_LEVEL[chipState.level].value;
      const durFn = FILTER_DURATION[chipState.duration].match;
      return list.filter((w) => {
        if (goalFn && !goalFn(w)) return false;
        if (levelVal && w.level !== levelVal) return false;
        if (durFn && !durFn(w)) return false;
        return true;
      });
    }

    function updateChipLabels() {
      const goalBtn = document.querySelector('.chip[data-filter="goal"]');
      const levelBtn = document.querySelector('.chip[data-filter="level"]');
      const durBtn = document.querySelector('.chip[data-filter="duration"]');
      if (goalBtn) {
        goalBtn.textContent = FILTER_GOAL[chipState.goal].label;
        goalBtn.classList.toggle("is-active", chipState.goal > 0);
      }
      if (levelBtn) {
        levelBtn.textContent = FILTER_LEVEL[chipState.level].label;
        levelBtn.classList.toggle("is-active", chipState.level > 0);
      }
      if (durBtn) {
        durBtn.textContent = FILTER_DURATION[chipState.duration].label;
        durBtn.classList.toggle("is-active", chipState.duration > 0);
      }
    }

    function resetChipFilters() {
      chipState.goal = 0;
      chipState.level = 0;
      chipState.duration = 0;
      updateChipLabels();
    }

    function render() {
      let list = getAllWorkouts();
      if (activeCategory !== "Все") list = list.filter((w) => w.category === activeCategory);
      list = applyChipFilters(list);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter((w) => [w.title, w.type, w.level].some((f) => f.toLowerCase().includes(q)));
      }
      grid.innerHTML = list.length
        ? list.map((w) => renderWorkoutCard(w, getSession())).join("")
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

    $("search-input")?.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      render();
    });

    document.querySelectorAll(".chip[data-filter]").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const kind = chip.dataset.filter;
        if (kind === "reset") {
          resetChipFilters();
          toast("Фильтры сброшены");
          render();
          return;
        }
        if (kind === "goal") {
          chipState.goal = (chipState.goal + 1) % FILTER_GOAL.length;
          toast("Цель: " + FILTER_GOAL[chipState.goal].label);
        } else if (kind === "level") {
          chipState.level = (chipState.level + 1) % FILTER_LEVEL.length;
          toast("Уровень: " + FILTER_LEVEL[chipState.level].label);
        } else if (kind === "duration") {
          chipState.duration = (chipState.duration + 1) % FILTER_DURATION.length;
          toast("Длительность: " + FILTER_DURATION[chipState.duration].label);
        }
        updateChipLabels();
        render();
      });
    });

    $("btn-create-workout")?.addEventListener("click", () => {
      const session = getSession();
      if (!isRegistered(session)) {
        toast("Создавать тренировки могут только зарегистрированные пользователи", true);
        return;
      }
      setModalOpen("modal-create", true);
    });

    $("modal-close")?.addEventListener("click", () => setModalOpen("modal-create", false));
    $("modal-cancel")?.addEventListener("click", () => setModalOpen("modal-create", false));
    $("modal-create")?.addEventListener("click", (e) => {
      if (e.target.id === "modal-create") setModalOpen("modal-create", false);
    });

    $("create-workout-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const title = fd.get("title").trim();
      if (!title) return toast("Введите название", true);
      const session = getSession();
      saveCustomWorkouts(getCustomWorkouts().concat([{
        id: uid(),
        title,
        category: fd.get("category"),
        type: fd.get("type").trim() || "Своя",
        duration: parseInt(fd.get("duration"), 10) || 30,
        level: fd.get("level"),
        custom: true,
        userId: session.userId,
        image: CUSTOM_WORKOUT_IMAGE,
      }]));
      setModalOpen("modal-create", false);
      e.target.reset();
      toast("Тренировка «" + title + "» добавлена!");
      render();
    });

    render();
  }

  function renderMyWorkoutsList() {
    const section = $("my-workouts-section");
    const listEl = $("my-workouts-list");
    if (!section || !listEl) return;

    const session = getSession();
    const mine = getUserCustomWorkouts(session);
    if (!isRegistered(session) || !mine.length) {
      section.hidden = true;
      listEl.innerHTML = "";
      return;
    }

    section.hidden = false;
    listEl.innerHTML = mine.map((w) => `
      <li class="list-cards__item my-workout-item">
        <div class="my-workout-item__info">
          <strong>${escapeHtml(w.title)}</strong>
          <p class="my-workout-item__meta">${escapeHtml(w.type)} · ${w.duration} мин · ${escapeHtml(w.level)}</p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <a href="workout.html?id=${encodeURIComponent(w.id)}" class="btn btn--primary" style="width:auto">Открыть</a>
          <button type="button" class="btn btn--danger btn-delete" data-id="${w.id}">Удалить</button>
        </div>
      </li>`).join("");
    bindDeleteButtons();
  }

  function buildProfileContext(user, history) {
    const stats = user?.stats || { workouts: 0, calories: 0, minutes: 0, streak: 0 };
    const now = new Date();
    const monthHistory = history.filter((h) => {
      const d = new Date(h.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return { stats, history, monthWorkouts: monthHistory.length, monthMinutes: monthHistory.reduce((s, h) => s + (h.duration || 0), 0) };
  }

  function getMonthlyBuckets(history) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const buckets = Array.from({ length: daysInMonth }, () => ({ count: 0, minutes: 0 }));
    history.forEach((h) => {
      const d = new Date(h.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const idx = d.getDate() - 1;
        buckets[idx].count += 1;
        buckets[idx].minutes += h.duration || 0;
      }
    });
    return { buckets, year, month, daysInMonth };
  }

  function guessAchievementDate(id, history) {
    const sorted = [...history].sort((a, b) => a.date - b.date);
    const idxMap = { first_workout: 0, five_workouts: 4, ten_workouts: 9 };
    if (idxMap[id] !== undefined && sorted[idxMap[id]]) return sorted[idxMap[id]].date;
    if (id.startsWith("month_")) {
      const now = new Date();
      const monthItems = sorted.filter((h) => {
        const d = new Date(h.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const need = id === "month_10" ? 10 : 3;
      if (monthItems[need - 1]) return monthItems[need - 1].date;
    }
    return sorted.at(-1)?.date || null;
  }

  function renderMonthlyActivity(history, isGuest) {
    const el = $("activity-chart");
    if (!el) return;
    if (isGuest) {
      el.innerHTML = '<p class="activity-chart__empty">Войдите в аккаунт, чтобы видеть активность за месяц</p>';
      return;
    }

    const { buckets, year, month, daysInMonth } = getMonthlyBuckets(history);
    const totalWorkouts = buckets.reduce((s, b) => s + b.count, 0);
    const totalMinutes = buckets.reduce((s, b) => s + b.minutes, 0);
    if (!totalWorkouts) {
      el.innerHTML = `<div class="activity-chart__head"><span class="activity-chart__title">Активность за ${escapeHtml(MONTH_NAMES_RU[month])}</span></div><p class="activity-chart__empty">В этом месяце пока нет тренировок. Завершите тренировку в каталоге.</p>`;
      return;
    }

    const maxMinutes = Math.max(1, ...buckets.map((b) => b.minutes));
    const bars = buckets.map((b, i) => {
      const day = i + 1;
      const height = b.minutes ? Math.max(8, Math.round((b.minutes / maxMinutes) * 100)) : 4;
      const label = day === 1 || day % 5 === 0 || day === daysInMonth ? `<span class="activity-bar__label">${day}</span>` : '<span class="activity-bar__label" aria-hidden="true">&nbsp;</span>';
      const title = b.count ? `${day} ${MONTH_NAMES_RU[month]}: ${b.count} тр., ${b.minutes} мин` : `${day} ${MONTH_NAMES_RU[month]}`;
      return `<div class="activity-bar" title="${escapeHtml(title)}"><div class="activity-bar__fill${b.count ? " activity-bar__fill--active" : ""}" style="height:${height}%"></div>${label}</div>`;
    }).join("");

    el.innerHTML = `<div class="activity-chart__head"><span class="activity-chart__title">Активность за ${escapeHtml(MONTH_NAMES_RU[month])} ${year}</span><span class="activity-chart__summary">${totalWorkouts} тр. · ${totalMinutes} мин</span></div><div class="activity-chart__bars">${bars}</div>`;
  }

  function renderAchievements(user, history, isGuest) {
    const grid = $("achievements-grid");
    const feed = $("achievements-feed");
    if (!grid || !feed) return;

    if (isGuest) {
      grid.innerHTML = '<p class="activity-chart__empty" style="grid-column:1/-1">Достижения доступны после регистрации</p>';
      feed.innerHTML = '<li class="achievements-feed__empty">Завершайте тренировки — награды появятся здесь</li>';
      return;
    }

    const ctx = buildProfileContext(user, history);
    const unlocked = ACHIEVEMENTS.filter((a) => a.need(ctx));

    grid.innerHTML = ACHIEVEMENTS.map((a) => {
      const ok = a.need(ctx);
      return `<div class="award-box${ok ? " award-box--unlocked" : " award-box--locked"}" title="${escapeHtml(a.desc)}"><span class="award-box__icon">${achievementIcon(a.icon)}</span><span class="award-box__title">${escapeHtml(a.title)}</span><span class="award-box__desc">${escapeHtml(a.desc)}</span></div>`;
    }).join("");

    if (!unlocked.length) {
      feed.innerHTML = '<li class="achievements-feed__empty">Пока нет достижений — завершите первую тренировку</li>';
      return;
    }

    feed.innerHTML = unlocked
      .map((a) => ({ a, date: guessAchievementDate(a.id, history) }))
      .sort((x, y) => (y.date || 0) - (x.date || 0))
      .map(({ a, date }) => {
        const when = date ? new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "получено";
        return `<li class="achievements-feed__item"><span class="achievements-feed__main"><span class="achievements-feed__icon">${achievementIcon(a.icon, "ui-icon--sm")}</span><span><strong>${escapeHtml(a.title)}</strong> — ${escapeHtml(a.desc)}</span></span><span class="achievements-feed__date">${when}</span></li>`;
      }).join("");
  }

  function initWorkout() {
    const w = findWorkout(new URLSearchParams(location.search).get("id") || "w4") || DEFAULT_WORKOUTS[0];
    if ($("workout-title")) $("workout-title").textContent = w.title;
    if ($("workout-subtitle")) $("workout-subtitle").textContent = w.type + " · " + w.duration + " мин";

    const preview = $("workout-preview");
    if (preview) {
      preview.innerHTML = `<img src="${escapeHtml(getWorkoutImage(w))}" alt="${escapeHtml(w.title)}">`;
    }

    let stepIndex = 0;
    let setCount = 0;
    let isFinishing = false;
    let lastStepAdvanceAt = 0;
    let seconds = 0;
    let running = false;
    let started = false;

    function setWorkoutControlsActive(active) {
      $("btn-pause")?.toggleAttribute("disabled", !active);
      $("btn-next")?.toggleAttribute("disabled", !active);
      $("btn-finish")?.toggleAttribute("disabled", !active);
    }

    function updateWorkoutStats() {
      if ($("step-value")) $("step-value").textContent = stepIndex + 1 + " / " + WORKOUT_STEPS.length;
      if ($("sets-value")) $("sets-value").textContent = String(setCount);
    }

    function renderSteps() {
      const list = $("workout-steps");
      if (!list) return;
      list.innerHTML = WORKOUT_STEPS.map((name, i) => {
        if (i !== stepIndex) return `<li class="list-cards__item">${escapeHtml(name)}</li>`;
        return `<li class="list-cards__item list-cards__item--active"><span class="list-cards__item-row"><span>${escapeHtml(name)}</span><span class="badge">Сейчас</span></span></li>`;
      }).join("");
      const subtitle = $("workout-subtitle");
      if (subtitle) {
        subtitle.textContent = (setCount > 0 ? "Подход " + setCount + " · " : "") + WORKOUT_STEPS[stepIndex] + " · " + w.type + " · " + w.duration + " мин";
      }
      updateWorkoutStats();
    }

    renderSteps();

    const timerEl = $("timer-value");
    const interval = setInterval(() => {
      if (!running) return;
      seconds++;
      if (timerEl) timerEl.textContent = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
    }, 1000);

    $("btn-start")?.addEventListener("click", function () {
      if (started || isFinishing) return;
      started = true;
      running = true;
      this.hidden = true;
      setWorkoutControlsActive(true);
      toast("Тренировка началась");
    });

    $("btn-pause")?.addEventListener("click", function () {
      if (!started || isFinishing) return;
      running = !running;
      this.textContent = running ? "Пауза" : "Продолжить";
    });

    $("btn-next")?.addEventListener("click", () => {
      if (!started || isFinishing || Date.now() - lastStepAdvanceAt < 450) return;
      lastStepAdvanceAt = Date.now();
      if (stepIndex < WORKOUT_STEPS.length - 1) {
        stepIndex += 1;
        renderSteps();
        toast("Этап: " + WORKOUT_STEPS[stepIndex]);
        return;
      }
      setCount += 1;
      stepIndex = 0;
      renderSteps();
      toast("Подход " + setCount + " завершён · снова " + WORKOUT_STEPS[0]);
    });

    $("btn-finish")?.addEventListener("click", function () {
      if (isFinishing || !started) return;
      isFinishing = true;
      this.disabled = true;
      $("btn-start")?.setAttribute("hidden", "");
      $("btn-next")?.setAttribute("disabled", "disabled");
      $("btn-pause")?.setAttribute("disabled", "disabled");
      clearInterval(interval);

      const res = completeWorkout(w);
      if (!res.ok) {
        isFinishing = false;
        this.disabled = false;
        $("btn-next")?.removeAttribute("disabled");
        $("btn-pause")?.removeAttribute("disabled");
        toast(res.error, true);
        return;
      }
      this.textContent = "Сохранение…";
      toast(res.saved ? "Тренировка завершена! +" + w.duration + " мин" : "Тренировка завершена");
      go("profile.html", 1200);
    });
  }

  function initProfile() {
    const session = getSession();
    if (!session) return;

    let user = isRegistered(session) ? getUserById(session.userId) : null;
    const nameEl = $("profile-name");
    const statusEl = $("profile-status");
    const emailEl = $("profile-email");
    const editBtn = $("btn-edit-profile");

    if (editBtn) editBtn.hidden = !user;
    if (emailEl) {
      emailEl.hidden = !user;
      if (user) emailEl.textContent = user.email;
    }
    if (nameEl) nameEl.textContent = session.name;
    if (statusEl) statusEl.textContent = session.isGuest ? "Статус: гость" : "Статус: активный";
    if ($("profile-avatar")) $("profile-avatar").innerHTML = '<img src="assets/logo.png" alt="Аватар">';

    const stats = user?.stats || { workouts: 0, calories: 0, minutes: 0, streak: 0 };
    [["workouts", stats.workouts], ["calories", stats.calories], ["minutes", stats.minutes + " мин"], ["streak", stats.streak]].forEach(([key, val]) => {
      const el = $("stat-" + key);
      if (el) el.textContent = val;
    });

    const history = isRegistered(session) ? getHistory() : [];
    const histEl = $("history-list");
    if (histEl) {
      histEl.innerHTML = history.length
        ? history.slice(0, 8).map((h) => `<li class="list-cards__item history-item"><span>${escapeHtml(h.title)} / ${h.duration} мин</span><span>Завершено</span></li>`).join("")
        : `<li class="list-cards__item">${session.isGuest ? "История доступна после регистрации" : "Пока нет завершённых тренировок"}</li>`;
    }

    renderMyWorkoutsList();
    renderMonthlyActivity(history, session.isGuest);
    renderAchievements(user, history, session.isGuest);

    editBtn?.addEventListener("click", () => user && setModalOpen("modal-edit-profile", true));
    $("edit-profile-cancel")?.addEventListener("click", () => setModalOpen("modal-edit-profile", false));
    $("modal-edit-profile")?.addEventListener("click", (e) => {
      if (e.target.id === "modal-edit-profile") setModalOpen("modal-edit-profile", false);
    });

    $("edit-profile-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!user) return;
      const fd = new FormData(e.target);
      const email = fd.get("email");
      if (!isValidEmail(email)) return toast(EMAIL_ERROR, true);
      const res = updateUserProfile(user.id, { name: fd.get("name"), email });
      if (!res.ok) return toast(res.error, true);
      user = res.user;
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      setModalOpen("modal-edit-profile", false);
      toast("Профиль обновлён");
    });

    if (new URLSearchParams(location.search).get("edit") === "1" && user) {
      $("edit-name").value = user.name;
      $("edit-email").value = user.email;
      setModalOpen("modal-edit-profile", true);
    }
  }

  function initSettings() {
    let s = applyAllSettings();
    const session = getSession();
    const loggedIn = isRegistered(session);
    if ($("settings-account-panel")) $("settings-account-panel").hidden = !loggedIn;
    if ($("settings-guest-hint")) $("settings-guest-hint").hidden = loggedIn;

    const persist = () => {
      saveSettings(s);
      applyTheme(s.theme);
      updateSettingsUI(s);
    };

    $("toggle-notifications")?.addEventListener("click", () => {
      s.notifications = !s.notifications;
      persist();
      toast(s.notifications ? "Уведомления включены" : "Уведомления выключены");
    });
    $("toggle-theme")?.addEventListener("click", () => {
      s.theme = s.theme === "light" ? "dark" : "light";
      persist();
      toast(s.theme === "light" ? "Светлая тема" : "Тёмная тема");
    });
    $("btn-save-settings")?.addEventListener("click", () => {
      persist();
      toast("Настройки сохранены");
    });
    $("btn-logout")?.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
      toast("Вы вышли из аккаунта");
      go("index.html");
    });
  }

  function showPendingAuthToast() {
    const page = getPage();
    if (sessionStorage.getItem("auth_need_login")) {
      sessionStorage.removeItem("auth_need_login");
      if (page === "login") toast("Войдите в аккаунт или войдите как гость", true);
    }
    if (sessionStorage.getItem("auth_already_in")) {
      sessionStorage.removeItem("auth_already_in");
      if (page === "catalog") toast("Вы уже вошли в аккаунт");
    }
  }

  function initNavAuth() {
    document.querySelectorAll('a[href="index.html"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        if (isRegistered(getSession())) {
          e.preventDefault();
          toast("Вы уже вошли в аккаунт");
        }
      });
    });
    document.querySelectorAll('a[href^="profile.html"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        if (!getSession()) {
          e.preventDefault();
          sessionStorage.setItem("auth_need_login", "1");
          go("index.html");
        }
      });
    });
    document.querySelectorAll('a[href="register.html"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        if (isRegistered(getSession())) {
          e.preventDefault();
          toast("Вы уже вошли — регистрация не нужна");
        }
      });
    });
  }

  function initGlobal() {
    if (typeof GymLucide !== "undefined") GymLucide.init();
    applyAllSettings();
    showPendingAuthToast();
    initNavAuth();
    document.querySelectorAll(".sidebar-categories .list-cards__item").forEach((item, i) => {
      if (!item.dataset.category) item.dataset.category = CATEGORIES[i + 1] || item.textContent.trim();
    });
    const firstCat = document.querySelector('.sidebar-categories .list-cards__item[data-category="Все"]');
    if (firstCat) firstCat.dataset.category = "Все";
  }

  document.addEventListener("DOMContentLoaded", () => {
    initGlobal();
    const init = PAGE_INIT[getPage()];
    if (init) init();
  });
})();
