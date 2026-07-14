/* Ember — demo logic.
   Everything is local: localStorage for your own state, a seeded simulation
   for the rest of the house. No network, no notifications, by design. */

(function () {
  "use strict";

  /* ── House data ─────────────────────────────────────── */

  var PERSONAS = [
    { id: "meera", name: "Meera", room: "Aldona" },
    { id: "kabir", name: "Kabir", room: "Vagator" },
    { id: "ananya", name: "Ananya", room: "Assagao" }
  ];

  var RESIDENTS = [
    { id: "meera", name: "Meera", room: "Aldona" },
    { id: "kabir", name: "Kabir", room: "Vagator" },
    { id: "ananya", name: "Ananya", room: "Assagao" },
    { id: "rohan", name: "Rohan", room: "Anjuna" },
    { id: "priya", name: "Priya", room: "Parra" },
    { id: "dev", name: "Dev", room: "Moira" }
  ];

  var STATUS_COPY = {
    "deep-work": { title: "Deep Work", ledger: "Deep work" },
    open: { title: "Open", sub: "Happy to be found", ledger: "Open to connect" },
    offline: { title: "Offline", sub: "Resting — off the ledger", ledger: "Offline" }
  };

  var SEED_POSTS = [
    {
      author: "ananya", tag: "making", hoursAgo: 2,
      body: "Recording the sounds of the monsoon every evening. Looking for someone to help turn them into a short film."
    },
    {
      author: "rohan", tag: "offering", hoursAgo: 5,
      body: "Free pour-over lessons, 7–8am at the Koru bar. Bring your own cup."
    },
    {
      author: "kabir", tag: "looking", hoursAgo: 26,
      body: "A running partner for slow 6km loops along the Chapora river at dawn."
    }
  ];

  var SPACES = [
    { id: "lab", name: "Deep Work Lab", startHour: 8, endHour: 23 },
    { id: "ice", name: "Ice Bath", startHour: 7, endHour: 22 },
    { id: "sauna", name: "Sauna", startHour: 15, endHour: 22 }
  ];

  var THREADS = {
    meera: [
      {
        place: "Hotaru Dharamkot", dates: "Feb 3 – Mar 1, 2026",
        people: [
          { name: "Ilya", note: "paired on the trail-mapping zine" },
          { name: "Sana", note: "morning sauna circle, most days" },
          { name: "Tenzin", note: "hosted the momo night you cooked for" }
        ]
      }
    ],
    kabir: [
      {
        place: "Hotaru Dharamkot", dates: "Nov 10 – Dec 20, 2025",
        people: [
          { name: "Meera", note: "edited your river film's sound" },
          { name: "Rohan", note: "coffee cupping, every Saturday" }
        ]
      }
    ],
    ananya: []
  };

  /* ── Persistence ────────────────────────────────────── */

  var STORE_KEY = "ember.demo.v1";

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* private mode etc. */ }
    return null;
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (e) { /* non-fatal in demo */ }
  }

  function freshPersonaState() {
    return { status: "open", post: null, bookings: [] };
  }

  var store = loadStore() || {
    personaId: "meera",
    seed: Math.floor(Math.random() * 100000),
    personas: {
      meera: { status: "deep-work", post: null, bookings: [] },
      kabir: freshPersonaState(),
      ananya: freshPersonaState()
    }
  };

  function me() {
    return store.personas[store.personaId];
  }

  function persona() {
    return PERSONAS.find(function (p) { return p.id === store.personaId; });
  }

  /* ── Small utilities ────────────────────────────────── */

  function $(id) { return document.getElementById(id); }

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  function fmtTime(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    var ampm = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
  }

  function relTime(ts) {
    var mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
    if (mins < 60) return mins + "m ago";
    var hours = Math.round(mins / 60);
    if (hours < 24) return hours + "h ago";
    return hours < 48 ? "yesterday" : Math.round(hours / 24) + "d ago";
  }

  /* Last Sunday 22:00 — the board's weekly wipe boundary. */
  function lastWipe() {
    var d = new Date();
    d.setHours(22, 0, 0, 0);
    var back = d.getDay() === 0 && Date.now() < d.getTime() ? 7 : d.getDay();
    d.setDate(d.getDate() - back);
    return d.getTime();
  }

  function nextWipeText() {
    var now = new Date();
    var days = (7 - now.getDay()) % 7;
    if (days === 0) return "The board clears tonight.";
    if (days === 1) return "The board clears tomorrow night.";
    return "The board clears Sunday night.";
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-visible");
    }, 2400);
  }

  /* ── Presence simulation ────────────────────────────── */

  var presence = {};

  function seedPresence() {
    var day = new Date().toDateString();
    RESIDENTS.forEach(function (r) {
      var roll = hash(r.id + day + store.seed);
      presence[r.id] = roll < 0.3 ? "deep-work" : roll < 0.78 ? "open" : "offline";
    });
  }

  function driftPresence() {
    var others = RESIDENTS.filter(function (r) { return r.id !== store.personaId; });
    var pick = others[Math.floor(Math.random() * others.length)];
    var cycle = ["open", "deep-work", "open", "offline"];
    var next = cycle[(cycle.indexOf(presence[pick.id]) + 1 + Math.floor(Math.random() * 2)) % cycle.length];
    presence[pick.id] = next;
    renderLedger();
    scheduleDrift();
  }

  function scheduleDrift() {
    setTimeout(driftPresence, 22000 + Math.random() * 26000);
  }

  /* ── Home ───────────────────────────────────────────── */

  function renderGreeting() {
    var now = new Date();
    var hour = now.getHours();
    var word = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    $("greetingText").textContent = word + ", " + persona().name + ".";
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    $("greetingMeta").textContent = days[now.getDay()] + " · " + fmtTime(now.getHours() * 60 + now.getMinutes());
  }

  function focusedUntil() {
    var now = new Date();
    var mins = now.getHours() * 60 + now.getMinutes() + 90;
    mins = Math.min(Math.ceil(mins / 30) * 30, 23 * 60);
    return "Focused until " + fmtTime(mins);
  }

  function renderStatus() {
    var status = me().status;
    var copy = STATUS_COPY[status];
    var sub = status === "deep-work" ? focusedUntil() : copy.sub;
    $("statusLabel").innerHTML = "";
    $("statusLabel").appendChild(document.createTextNode(copy.title));
    var em = document.createElement("em");
    em.textContent = sub;
    $("statusLabel").appendChild(em);

    document.querySelectorAll(".ember-pill").forEach(function (pill) {
      pill.classList.toggle("is-active", pill.dataset.status === status);
    });

    $("emberApp").classList.toggle("status-offline", status === "offline");
  }

  function renderLedger() {
    presence[store.personaId] = me().status;

    var list = $("ledgerList");
    list.innerHTML = "";

    var visible = RESIDENTS.filter(function (r) {
      return r.id !== store.personaId && presence[r.id] !== "offline";
    });

    visible.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "ember-ledger__item";
      var dot = document.createElement("span");
      dot.className = "ember-ledger__dot ember-ledger__dot--" + presence[r.id];
      var name = document.createElement("span");
      name.className = "ember-ledger__name";
      name.textContent = r.name;
      var status = document.createElement("span");
      status.className = "ember-ledger__status";
      status.textContent = STATUS_COPY[presence[r.id]].ledger;
      li.appendChild(dot);
      li.appendChild(name);
      li.appendChild(status);
      list.appendChild(li);
    });

    var count = visible.length + (me().status !== "offline" ? 1 : 0);
    $("ledgerCount").textContent = count + " here now";
  }

  /* ── The Board ──────────────────────────────────────── */

  function boardPosts() {
    var wipe = lastWipe();
    var posts = [];

    if (me().post && me().post.createdAt > wipe) {
      posts.push({
        mine: true,
        name: "You",
        room: persona().room,
        tag: me().post.tag,
        body: me().post.body,
        createdAt: me().post.createdAt
      });
    } else if (me().post) {
      me().post = null;
      saveStore();
    }

    SEED_POSTS.forEach(function (p) {
      if (p.author === store.personaId) return;
      var res = RESIDENTS.find(function (r) { return r.id === p.author; });
      posts.push({
        mine: false,
        name: res.name,
        room: res.room,
        tag: p.tag,
        body: p.body,
        createdAt: Date.now() - p.hoursAgo * 3600000
      });
    });

    return posts;
  }

  function renderBoard() {
    var list = $("boardList");
    list.innerHTML = "";
    var posts = boardPosts();

    if (!posts.length) {
      var empty = document.createElement("div");
      empty.className = "ember-board__empty";
      empty.textContent = "The board is clear. Someone has to go first.";
      list.appendChild(empty);
    }

    posts.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "ember-card" + (p.mine ? " ember-card--mine" : "");

      var head = document.createElement("div");
      head.className = "ember-card__head";

      var initial = document.createElement("span");
      initial.className = "ember-card__initial";
      initial.textContent = p.name.charAt(0);

      var who = document.createElement("div");
      who.className = "ember-card__who";
      var name = document.createElement("p");
      name.className = "ember-card__name";
      name.textContent = p.name;
      var meta = document.createElement("p");
      meta.className = "ember-card__meta";
      meta.textContent = p.room + " · " + relTime(p.createdAt);
      who.appendChild(name);
      who.appendChild(meta);

      var tag = document.createElement("span");
      tag.className = "ember-card__tag" + (p.tag !== "making" ? " ember-card__tag--" + p.tag : "");
      tag.textContent = p.tag;

      head.appendChild(initial);
      head.appendChild(who);
      head.appendChild(tag);

      var body = document.createElement("p");
      body.className = "ember-card__body";
      body.textContent = p.body;

      card.appendChild(head);
      card.appendChild(body);
      list.appendChild(card);
    });

    $("boardCta").textContent = me().post ? "Edit your post" : "+ Post to the board";
    $("boardWipe").textContent = "One post per person. " + nextWipeText();
  }

  /* ── Compose sheet ──────────────────────────────────── */

  var composeTag = "making";

  function openCompose() {
    var post = me().post;
    composeTag = post ? post.tag : "making";
    $("composeInput").value = post ? post.body : "";
    $("composeCount").textContent = $("composeInput").value.length + " / 160";
    $("composeTitle").textContent = post ? "Your post" : "Pin to the board";
    $("composeSubmit").textContent = post ? "Replace your post" : "Pin to the board";
    $("composeRemove").hidden = !post;
    document.querySelectorAll(".ember-tag-pick").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.tag === composeTag);
    });
    openSheet("composeSheet");
    setTimeout(function () { $("composeInput").focus({ preventScroll: true }); }, 350);
  }

  function submitCompose() {
    var text = $("composeInput").value.trim();
    if (!text) {
      $("composeInput").focus();
      return;
    }
    var replacing = !!me().post;
    me().post = { tag: composeTag, body: text, createdAt: Date.now() };
    saveStore();
    closeSheets();
    renderBoard();
    toast(replacing ? "Your post was replaced." : "Pinned. The house will find it.");
  }

  function removePost() {
    me().post = null;
    saveStore();
    closeSheets();
    renderBoard();
    toast("Your post is down.");
  }

  /* ── Spaces ─────────────────────────────────────────── */

  var activeSpace = SPACES[0].id;
  var dayOffset = 0;
  var selection = null; /* { minutes, mine } */

  function dayKey(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toDateString();
  }

  function slotList(space) {
    var slots = [];
    for (var m = space.startHour * 60; m < space.endHour * 60; m += 30) {
      slots.push(m);
    }
    return slots;
  }

  function houseBooked(spaceId, offset, minutes) {
    return hash(spaceId + dayKey(offset) + minutes + store.seed) < 0.3;
  }

  function myBooking(spaceId, offset, minutes) {
    return me().bookings.some(function (b) {
      return b.space === spaceId && b.day === dayKey(offset) && b.minutes === minutes;
    });
  }

  function renderDayLabel() {
    var d = new Date();
    d.setDate(d.getDate() + dayOffset);
    var names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var label = dayOffset === 0 ? "Today" : dayOffset === 1 ? "Tomorrow" : names[d.getDay()];
    $("dayLabel").innerHTML = "";
    $("dayLabel").appendChild(document.createTextNode(label + " "));
    var span = document.createElement("span");
    span.textContent = "· " + names[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()];
    $("dayLabel").appendChild(span);
    $("dayPrev").disabled = dayOffset === 0;
    $("dayNext").disabled = dayOffset === 2;
  }

  function renderSpaceTabs() {
    var wrap = $("spaceTabs");
    wrap.innerHTML = "";
    SPACES.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ember-space-tab" + (s.id === activeSpace ? " is-active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", s.id === activeSpace ? "true" : "false");
      b.textContent = s.name;
      b.addEventListener("click", function () {
        activeSpace = s.id;
        selection = null;
        renderSpaces();
      });
      wrap.appendChild(b);
    });
  }

  function renderSlots() {
    var space = SPACES.find(function (s) { return s.id === activeSpace; });
    var list = $("slotList");
    list.innerHTML = "";

    var now = new Date();
    var nowMins = now.getHours() * 60 + now.getMinutes();

    slotList(space).forEach(function (m) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ember-slot";
      var time = document.createElement("span");
      time.className = "ember-slot__time";
      time.textContent = fmtTime(m) + " – " + fmtTime(m + 30);
      var state = document.createElement("span");
      state.className = "ember-slot__state";

      var isPast = dayOffset === 0 && m + 30 <= nowMins;
      var mine = myBooking(space.id, dayOffset, m);
      var booked = !mine && houseBooked(space.id, dayOffset, m);

      if (isPast && !mine) {
        b.classList.add("ember-slot--past");
        b.disabled = true;
        state.textContent = "Past";
      } else if (mine) {
        b.classList.add("ember-slot--mine");
        state.textContent = "Yours";
        b.addEventListener("click", function () {
          selection = (selection && selection.minutes === m && selection.mine) ? null : { minutes: m, mine: true };
          renderSlots();
        });
      } else if (booked) {
        b.classList.add("ember-slot--booked");
        b.disabled = true;
        state.textContent = "Booked";
      } else {
        state.textContent = "Available";
        b.addEventListener("click", function () {
          selection = (selection && selection.minutes === m && !selection.mine) ? null : { minutes: m, mine: false };
          renderSlots();
        });
      }

      if (selection && selection.minutes === m && !b.disabled) {
        b.classList.add("ember-slot--selected");
        if (!selection.mine) state.textContent = "Selected ✓";
      }

      b.appendChild(time);
      b.appendChild(state);
      list.appendChild(b);
    });

    renderBookCta(space);
  }

  function renderBookCta(space) {
    var cta = $("bookCta");
    var onSpaces = currentView === "spaces";
    if (!selection || !onSpaces) {
      cta.classList.remove("is-visible");
      cta.hidden = !onSpaces;
      return;
    }
    cta.hidden = false;
    cta.textContent = selection.mine
      ? "Release your " + fmtTime(selection.minutes) + " slot"
      : "Book " + space.name + " · " + fmtTime(selection.minutes);
    requestAnimationFrame(function () {
      cta.classList.add("is-visible");
    });
  }

  function confirmBooking() {
    if (!selection) return;
    var space = SPACES.find(function (s) { return s.id === activeSpace; });

    if (selection.mine) {
      me().bookings = me().bookings.filter(function (b) {
        return !(b.space === space.id && b.day === dayKey(dayOffset) && b.minutes === selection.minutes);
      });
      toast("Released. The slot is open again.");
    } else {
      me().bookings.push({ space: space.id, day: dayKey(dayOffset), minutes: selection.minutes });
      toast("Held for you. No reminders — just show up.");
    }
    saveStore();
    selection = null;
    renderSlots();
  }

  function renderSpaces() {
    renderSpaceTabs();
    renderDayLabel();
    renderSlots();
  }

  /* ── The Thread ─────────────────────────────────────── */

  function renderThread() {
    var wrap = $("threadList");
    wrap.innerHTML = "";

    var current = document.createElement("div");
    current.className = "ember-stay ember-stay--current";
    var place = document.createElement("p");
    place.className = "ember-stay__place";
    place.textContent = "Hotaru Siolim";
    var dates = document.createElement("p");
    dates.className = "ember-stay__dates";
    dates.textContent = "In progress";
    var note = document.createElement("p");
    note.className = "ember-stay__note";
    note.textContent = "When you check out, this stay is saved here as a simple record of the people you met and what you made together.";
    current.appendChild(place);
    current.appendChild(dates);
    current.appendChild(note);
    wrap.appendChild(current);

    (THREADS[store.personaId] || []).forEach(function (stay) {
      var card = document.createElement("div");
      card.className = "ember-stay";

      var p = document.createElement("p");
      p.className = "ember-stay__place";
      p.textContent = stay.place;
      var d = document.createElement("p");
      d.className = "ember-stay__dates";
      d.textContent = stay.dates;
      var label = document.createElement("p");
      label.className = "ember-stay__label";
      label.textContent = "Built with";
      var ul = document.createElement("ul");
      ul.className = "ember-stay__people";

      stay.people.forEach(function (person) {
        var li = document.createElement("li");
        li.className = "ember-stay__person";
        var strong = document.createElement("strong");
        strong.textContent = person.name;
        var span = document.createElement("span");
        span.textContent = "— " + person.note;
        li.appendChild(strong);
        li.appendChild(span);
        ul.appendChild(li);
      });

      card.appendChild(p);
      card.appendChild(d);
      card.appendChild(label);
      card.appendChild(ul);
      wrap.appendChild(card);
    });
  }

  /* ── Persona switcher ───────────────────────────────── */

  function renderPersonaSheet() {
    var list = $("personaList");
    list.innerHTML = "";
    PERSONAS.forEach(function (p) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ember-persona" + (p.id === store.personaId ? " is-active" : "");

      var initial = document.createElement("span");
      initial.className = "ember-persona__initial";
      initial.textContent = p.name.charAt(0);

      var who = document.createElement("div");
      var name = document.createElement("p");
      name.className = "ember-persona__name";
      name.textContent = p.name;
      var meta = document.createElement("p");
      meta.className = "ember-persona__meta";
      meta.textContent = p.room + " · currently staying";
      who.appendChild(name);
      who.appendChild(meta);

      b.appendChild(initial);
      b.appendChild(who);
      b.addEventListener("click", function () {
        if (store.personaId !== p.id) {
          store.personaId = p.id;
          if (!store.personas[p.id]) store.personas[p.id] = freshPersonaState();
          saveStore();
          selection = null;
          renderAll();
          toast("Now viewing the house as " + p.name + ".");
        }
        closeSheets();
      });
      li.appendChild(b);
      list.appendChild(li);
    });
  }

  /* ── Sheets ─────────────────────────────────────────── */

  function openSheet(id) {
    $("scrim").classList.add("is-open");
    $(id).classList.add("is-open");
  }

  function closeSheets() {
    $("scrim").classList.remove("is-open");
    $("composeSheet").classList.remove("is-open");
    $("personaSheet").classList.remove("is-open");
  }

  /* ── Navigation ─────────────────────────────────────── */

  var currentView = "home";

  function showView(name) {
    if (name === currentView) return;
    currentView = name;

    document.querySelectorAll(".ember-view").forEach(function (view) {
      var active = view.dataset.view === name;
      view.classList.toggle("is-active", active);
      view.hidden = !active;
    });

    document.querySelectorAll(".ember-nav__link").forEach(function (link) {
      var active = link.dataset.nav === name;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (name === "spaces") {
      renderSpaces();
    } else {
      $("bookCta").classList.remove("is-visible");
      $("bookCta").hidden = true;
    }
  }

  /* ── Render all / init ──────────────────────────────── */

  function renderAll() {
    $("avatarBtn").textContent = persona().name.charAt(0);
    renderGreeting();
    renderStatus();
    renderLedger();
    renderBoard();
    renderSpaces();
    renderThread();
    renderPersonaSheet();
  }

  /* Events */

  document.querySelectorAll(".ember-nav__link").forEach(function (link) {
    link.addEventListener("click", function () { showView(link.dataset.nav); });
  });

  document.querySelectorAll(".ember-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      me().status = pill.dataset.status;
      saveStore();
      renderStatus();
      renderLedger();
    });
  });

  document.querySelectorAll(".ember-tag-pick").forEach(function (b) {
    b.addEventListener("click", function () {
      composeTag = b.dataset.tag;
      document.querySelectorAll(".ember-tag-pick").forEach(function (x) {
        x.classList.toggle("is-active", x === b);
      });
    });
  });

  $("avatarBtn").addEventListener("click", function () {
    renderPersonaSheet();
    openSheet("personaSheet");
  });

  $("boardCta").addEventListener("click", openCompose);
  $("composeSubmit").addEventListener("click", submitCompose);
  $("composeRemove").addEventListener("click", removePost);
  $("scrim").addEventListener("click", closeSheets);
  $("bookCta").addEventListener("click", confirmBooking);

  $("composeInput").addEventListener("input", function () {
    $("composeCount").textContent = $("composeInput").value.length + " / 160";
  });

  $("dayPrev").addEventListener("click", function () {
    if (dayOffset > 0) { dayOffset--; selection = null; renderSpaces(); }
  });

  $("dayNext").addEventListener("click", function () {
    if (dayOffset < 2) { dayOffset++; selection = null; renderSpaces(); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSheets();
  });

  /* The app frame must never scroll — focus and keyboard navigation can
     nudge overflow:hidden containers, which shears the whole layout. */
  var appEl = $("emberApp");
  appEl.addEventListener("scroll", function () {
    appEl.scrollTop = 0;
    appEl.scrollLeft = 0;
  });

  /* Clock + presence tick */
  setInterval(renderGreeting, 30000);

  seedPresence();
  scheduleDrift();
  renderAll();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }
})();
