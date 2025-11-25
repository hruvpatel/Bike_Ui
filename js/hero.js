// Full replacement: fixed initialization, category filtering, price GO, name search, autoplay, CTA normalize & add-to-cart
(function () {
  // helpers (keep existing)
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const formatNum = (n) => Number(n) || 0;
  const formatCurrency = (v) => "₹" + (Number(v) || 0).toLocaleString("en-IN");

  // small cart helpers (store items as { id, name, price, qty, img, brand })
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  function findCartIndex(cart, id) {
    return cart.findIndex((i) => i.id === id);
  }

  // render quantity controls inside given card (replaces or hides Add button)
  function renderQtyControls(card, qty) {
    // ensure unique id for item
    const id = card.dataset.id || card.dataset.name || card.dataset.name;
    card.dataset.id = id;

    // remove existing control container if present
    const existing = card.querySelector(".qty-controls");
    if (existing) existing.remove();

    // create controls container
    const wrap = document.createElement("div");
    wrap.className = "qty-controls";

    // trash / remove button (left)
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "qty-remove";
    removeBtn.innerHTML = '<i class="fa fa-trash"></i>';
    wrap.appendChild(removeBtn);

    // decrement
    const dec = document.createElement("button");
    dec.type = "button";
    dec.className = "qty-decrement";
    dec.textContent = "-";
    wrap.appendChild(dec);

    // qty display
    const span = document.createElement("span");
    span.className = "qty-value";
    span.textContent = String(qty || 1);
    wrap.appendChild(span);

    // increment
    const inc = document.createElement("button");
    inc.type = "button";
    inc.className = "qty-increment";
    inc.textContent = "+";
    wrap.appendChild(inc);

    // replace/add: hide original .bike-btn.add-cart (if present)
    const btn = card.querySelector(".bike-btn.add-cart");
    if (btn) btn.style.display = "none";
    // append controls to card-body
    const body = card.querySelector(".card-body") || card;
    body.appendChild(wrap);
  }

  // restore Add button (when qty removed)
  function restoreAddButton(card) {
    const ctr = card.querySelector(".qty-controls");
    if (ctr) ctr.remove();
    const btn = card.querySelector(".bike-btn.add-cart");
    if (btn) btn.style.display = "";
  }

  // update cart and UI helper
  function addOneToCard(card) {
    const id = card.dataset.id || card.dataset.name || card.dataset.name;
    const cart = getCart();
    const idx = findCartIndex(cart, id);
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    } else {
      cart.push({
        id,
        name:
          card.dataset.name ||
          card.querySelector(".bike-name")?.textContent ||
          id,
        price: card.dataset.price || null,
        brand: card.dataset.brand || null,
        img: card.querySelector("img")?.src || null,
        qty: 1,
      });
    }
    saveCart(cart);
    renderQtyControls(card, cart[findCartIndex(cart, id)].qty);
  }

  function setCardQty(card, newQty) {
    const id = card.dataset.id;
    const cart = getCart();
    const idx = findCartIndex(cart, id);
    if (idx < 0) return;
    if (newQty <= 0) {
      // remove item
      cart.splice(idx, 1);
      saveCart(cart);
      restoreAddButton(card);
      return;
    }
    cart[idx].qty = newQty;
    saveCart(cart);
    const span = card.querySelector(".qty-value");
    if (span) span.textContent = String(newQty);
  }

  // normalize CTAs (ensure buttons) - keep earlier logic but ensure button element
  function normalizeCTAs() {
    $$(".add-cart").forEach((n) => {
      const inner =
        '<i class="fa fa-shopping-cart" aria-hidden="true"></i>&nbsp; Add to cart';
      if (n.tagName.toLowerCase() === "button") {
        n.type = "button";
        n.classList.add("bike-btn");
        n.innerHTML = inner;
        return;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = (n.className || "") + " bike-btn add-cart";
      btn.innerHTML = inner;
      n.replaceWith(btn);
    });
  }

  // delegated click handler for add / qty controls
  function setupAddToCart() {
    document.addEventListener("click", function (e) {
      // Add to cart click
      const add = e.target.closest(".bike-btn.add-cart");
      if (add) {
        e.preventDefault();
        const card = add.closest(".bike-gallery-card");
        if (!card) return;
        addOneToCard(card);
        return;
      }

      // Qty increment
      const inc = e.target.closest(".qty-increment");
      if (inc) {
        e.preventDefault();
        const card = inc.closest(".bike-gallery-card");
        const current = Number(
          card.querySelector(".qty-value")?.textContent || 0
        );
        setCardQty(card, current + 1);
        return;
      }

      // Qty decrement
      const dec = e.target.closest(".qty-decrement");
      if (dec) {
        e.preventDefault();
        const card = dec.closest(".bike-gallery-card");
        const current = Number(
          card.querySelector(".qty-value")?.textContent || 0
        );
        setCardQty(card, current - 1);
        return;
      }

      // Remove (trash)
      const rem = e.target.closest(".qty-remove");
      if (rem) {
        e.preventDefault();
        const card = rem.closest(".bike-gallery-card");
        setCardQty(card, 0);
        return;
      }
    });
  }

  // on init: ensure cards reflect cart state (show qty controls for existing items)
  function syncCartToUI() {
    const cart = getCart();
    if (!cart.length) return;
    cart.forEach((item) => {
      // find card by id or name
      const card = Array.from(
        document.querySelectorAll(".bike-gallery-card")
      ).find(
        (c) =>
          c.dataset.id === item.id ||
          c.dataset.name === item.id ||
          c.dataset.name === item.name
      );
      if (card) renderQtyControls(card, item.qty);
    });
  }

  // Export helpers to window so main init can call them when ready
  window.__cartHelpers = {
    normalizeCTAs,
    setupAddToCart,
    syncCartToUI,
    renderQtyControls,
  };
})(); // Full replacement: fixed initialization, category filtering, price GO, name search, autoplay, CTA normalize & add-to-cart
(function () {
  // helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const formatNum = (n) => Number(n) || 0;
  const formatCurrency = (v) => "₹" + (Number(v) || 0).toLocaleString("en-IN");

  // ensure single init function exported
  window.initHero = function initHero() {
    const track = document.getElementById("bikeSlider");
    if (!track) return;

    const prev = $(".slider-arrow.prev");
    const next = $(".slider-arrow.next");
    const catButtons = $$(".cat-btn");
    const viewport = $(".bike-slider-viewport");

    // filter controls
    const priceMinInput = $("#priceMin");
    const priceMaxInput = $("#priceMax");
    const pmin = $("#pmin");
    const pmax = $("#pmax");
    const priceGo = $("#priceGo");
    const applyBtn = $("#applyFilters");
    const resetBtn = $("#resetFilters");
    const nameInput = $("#filterName");

    // categories fallback
    const categories = ["trending", "popular", "electric", "upcoming"];

    // collect cards - ensure selector picks our cards
    let cards = Array.from(track.querySelectorAll(".bike-gallery-card"));
    if (!cards.length) cards = Array.from(track.children);

    // assign missing data-cat to distribute items (so tabs work even if markup incomplete)
    cards.forEach((c, i) => {
      if (!c.dataset.cat) c.dataset.cat = categories[i % categories.length];
      // ensure dataset.price is numeric if present as text
      if (c.dataset.price) c.dataset.price = String(formatNum(c.dataset.price));
    });

    // current category: from active tab or default
    let currentCat =
      document.querySelector(".cat-btn.active")?.dataset.cat || "trending";
    let index = 0;

    function getCardsPerView() {
      const w = window.innerWidth;
      if (w >= 1200) return 4;
      if (w >= 900) return 3;
      if (w >= 600) return 2;
      return 1;
    }

    function updatePriceLabels() {
      if (pmin && priceMinInput)
        pmin.textContent = formatCurrency(priceMinInput.value);
      if (pmax && priceMaxInput)
        pmax.textContent = formatCurrency(priceMaxInput.value);
    }
    if (priceMinInput && priceMaxInput) {
      priceMinInput.addEventListener("input", updatePriceLabels);
      priceMaxInput.addEventListener("input", updatePriceLabels);
      updatePriceLabels();
    }

    function matchesFilters(card) {
      // category
      if (
        (card.dataset.cat || "").toLowerCase() !==
        (currentCat || "").toLowerCase()
      )
        return false;

      // name search
      const q = (nameInput?.value || "").trim().toLowerCase();
      if (q) {
        const n =
          (card.dataset.name || "").toLowerCase() ||
          (card.querySelector(".bike-name")?.textContent || "").toLowerCase();
        if (!n.includes(q)) return false;
      }

      // brands
      const checkedBrands = $$(".filter-brand:checked").map((el) => el.value);
      if (checkedBrands.length && !checkedBrands.includes(card.dataset.brand))
        return false;

      // delivery
      const checkedDel = $$(".filter-delivery:checked").map((el) => el.value);
      if (checkedDel.length && !checkedDel.includes(card.dataset.delivery))
        return false;

      // deals
      const checkedDeals = $$(".filter-deal:checked").map((el) => el.value);
      if (checkedDeals.length && !checkedDeals.includes("all")) {
        if (checkedDeals.includes("today") && card.dataset.deal !== "yes")
          return false;
      }

      // price range
      const minP = formatNum(priceMinInput?.value || 0);
      const maxP = formatNum(priceMaxInput?.value || 99999999);
      const price = formatNum(
        card.dataset.price || card.getAttribute("data-price") || 0
      );
      if (price < minP || price > maxP) return false;

      return true;
    }

    function applyFilterAndShow() {
      cards.forEach((card) => {
        const ok = matchesFilters(card);
        card.style.display = ok ? "flex" : "none";
      });
      index = 0;
      updateSlider();
    }

    function updateSlider() {
      const visible = cards.filter((c) => c.style.display !== "none");
      if (visible.length === 0) {
        track.style.transform = "translateX(0)";
        if (prev) prev.disabled = true;
        if (next) next.disabled = true;
        return;
      }
      const perView = getCardsPerView();
      const maxIndex = Math.max(0, Math.ceil(visible.length / perView) - 1);
      if (index > maxIndex) index = maxIndex;

      // compute step using first visible card width + gap
      const first = visible[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 18;
      const width = Math.round(first.getBoundingClientRect().width);
      const step = Math.round(width + gap);
      const translate = Math.max(0, index * perView * step);
      track.style.transform = `translateX(${-translate}px)`;

      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === maxIndex;
    }

    // prev/next control (NO autoplay)
    if (prev)
      prev.addEventListener("click", () => {
        index = Math.max(0, index - 1);
        updateSlider();
      });
    if (next)
      next.addEventListener("click", () => {
        index = index + 1;
        updateSlider();
      });

    // category tab clicks
    catButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        catButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCat = btn.dataset.cat;
        applyFilterAndShow();
      });
    });

    // apply / reset handlers
    if (applyBtn) applyBtn.addEventListener("click", applyFilterAndShow);
    if (resetBtn)
      resetBtn.addEventListener("click", () => {
        $$(".filter-brand:checked").forEach((i) => (i.checked = false));
        $$(".filter-delivery:checked").forEach((i) => (i.checked = false));
        $$(".filter-deal:checked").forEach((i) => (i.checked = false));
        if (priceMinInput) priceMinInput.value = 0;
        if (priceMaxInput) priceMaxInput.value = 300000;
        if (nameInput) nameInput.value = "";
        updatePriceLabels();
        applyFilterAndShow();
      });

    // price GO behaviour: call apply action
    if (priceGo)
      priceGo.addEventListener("click", (e) => {
        e.preventDefault();
        applyFilterAndShow();
      });

    // name input enter triggers apply
    if (nameInput)
      nameInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") applyFilterAndShow();
      });

    // normalize CTAs: transform anchors into Add to cart buttons with icon
    function normalizeCTAs() {
      $$(".add-cart").forEach((n) => {
        const inner =
          '<i class="fa fa-shopping-cart" aria-hidden="true"></i>&nbsp; Add to cart';
        if (n.tagName.toLowerCase() === "button") {
          n.type = "button";
          n.classList.add("bike-btn");
          n.innerHTML = inner;
          return;
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = (n.className || "") + " bike-btn add-cart";
        btn.innerHTML = inner;
        n.replaceWith(btn);
      });
    }

    // setup add-to-cart behaviour (delegated)
    function setupAddToCart() {
      document.addEventListener("click", function (e) {
        const btn = e.target.closest(".add-cart");
        if (!btn) return;
        e.preventDefault();
        const card = btn.closest(".bike-gallery-card");
        if (!card) return;
        const bike = {
          name:
            card.dataset.name ||
            card.querySelector(".bike-name")?.textContent ||
            "Bike",
          price: card.dataset.price || null,
          brand: card.dataset.brand || null,
          img: card.querySelector("img")?.src || null,
        };
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        cart.push(bike);
        localStorage.setItem("cart", JSON.stringify(cart));
        // minimal feedback
        alert((bike.name || "Item") + " added to cart");
      });
    }

    // init flow
    normalizeCTAs();
    setupAddToCart();

    // hide all first then show matching category
    cards.forEach((c) => (c.style.display = "none"));
    // pick initial active tab if exists
    const activeTab = document.querySelector(".cat-btn.active");
    if (activeTab) currentCat = activeTab.dataset.cat;
    applyFilterAndShow();

    // ensure arrows state is correct after initial render
    updateSlider();
  };

  // auto-init if hero already present (index.html should call initHero after injection as well)
  if (document.getElementById("bikeSlider")) window.initHero();
})();
// Cart module — replace/merge with your existing hero.js cart parts
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) =>
    Array.from((r || document).querySelectorAll(s));

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  function itemIdFromCard(card) {
    return (
      card.dataset.id ||
      card.dataset.name ||
      card.getAttribute("data-name") ||
      null
    );
  }
  function findCartIdx(cart, id) {
    return cart.findIndex((i) => i.id === id);
  }

  // Render qty controls (trash, -, qty, +) inside the card-body and hide Add button
  function renderQtyControls(card, qty) {
    if (!card) return;
    const id =
      itemIdFromCard(card) || "item-" + Math.random().toString(36).slice(2, 9);
    card.dataset.id = id;

    // remove previous controls if any
    const prev = card.querySelector(".qty-controls");
    if (prev) prev.remove();

    // create controls
    const wrap = document.createElement("div");
    wrap.className = "qty-controls";

    const trash = document.createElement("button");
    trash.type = "button";
    trash.className = "qty-remove";
    trash.setAttribute("aria-label", "remove");
    trash.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
    wrap.appendChild(trash);

    const dec = document.createElement("button");
    dec.type = "button";
    dec.className = "qty-decrement";
    dec.textContent = "−";
    wrap.appendChild(dec);

    const span = document.createElement("span");
    span.className = "qty-value";
    span.textContent = String(Math.max(1, Number(qty) || 1));
    wrap.appendChild(span);

    const inc = document.createElement("button");
    inc.type = "button";
    inc.className = "qty-increment";
    inc.textContent = "+";
    wrap.appendChild(inc);

    // hide existing Add button if present
    const addBtn = card.querySelector(".bike-btn.add-cart");
    if (addBtn) addBtn.style.display = "none";

    // append controls to card-body (create if absent)
    let body = card.querySelector(".card-body");
    if (!body) {
      body = document.createElement("div");
      body.className = "card-body";
      card.appendChild(body);
    }
    body.appendChild(wrap);
  }

  // Remove qty-controls and show Add button again
  function restoreAddButton(card) {
    if (!card) return;
    const ctr = card.querySelector(".qty-controls");
    if (ctr) ctr.remove();
    const addBtn = card.querySelector(".bike-btn.add-cart");
    if (addBtn) addBtn.style.display = "";
  }

  // Add one unit to item in cart and update UI
  function addOneToCard(card) {
    const id =
      itemIdFromCard(card) || "item-" + Math.random().toString(36).slice(2, 9);
    card.dataset.id = id;
    const cart = getCart();
    const idx = findCartIdx(cart, id);
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    } else {
      cart.push({
        id,
        name:
          card.dataset.name ||
          card.querySelector(".bike-name")?.textContent ||
          id,
        price: card.dataset.price || null,
        brand: card.dataset.brand || null,
        img: card.querySelector("img")?.src || null,
        qty: 1,
      });
    }
    saveCart(cart);
    renderQtyControls(card, cart[findCartIdx(cart, id)].qty);
  }

  // Set exact qty (used by +/-); if qty <= 0 remove item and restore button
  function setCardQty(card, newQty) {
    const id = itemIdFromCard(card);
    if (!id) return;
    const cart = getCart();
    const idx = findCartIdx(cart, id);
    if (idx < 0) return;
    if (newQty <= 0) {
      cart.splice(idx, 1);
      saveCart(cart);
      restoreAddButton(card);
      return;
    }
    cart[idx].qty = newQty;
    saveCart(cart);
    const span = card.querySelector(".qty-value");
    if (span) span.textContent = String(newQty);
  }

  // Normalize any existing add-cart anchors to buttons (keeps class .add-cart)
  function normalizeCTAs(root = document) {
    $$(".add-cart", root).forEach((node) => {
      const inner =
        '<i class="fa fa-shopping-cart" aria-hidden="true"></i>&nbsp; Add to cart';
      if (node.tagName.toLowerCase() === "button") {
        node.type = "button";
        node.classList.add("bike-btn");
        node.innerHTML = inner;
        return;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = (node.className || "") + " bike-btn add-cart";
      btn.innerHTML = inner;
      node.replaceWith(btn);
    });
  }

  // Attach delegated click handler for add/qty controls
  function setupAddToCart(root = document) {
    if (window.__cartClickBound) return;
    window.__cartClickBound = true;

    root.addEventListener("click", function (e) {
      const add = e.target.closest(".bike-btn.add-cart");
      if (add) {
        e.preventDefault();
        const card = add.closest(".bike-gallery-card");
        if (!card) return;
        addOneToCard(card);
        return;
      }

      const inc = e.target.closest(".qty-increment");
      if (inc) {
        e.preventDefault();
        const card = inc.closest(".bike-gallery-card");
        if (!card) return;
        const cur = Number(card.querySelector(".qty-value")?.textContent || 0);
        setCardQty(card, cur + 1);
        return;
      }

      const dec = e.target.closest(".qty-decrement");
      if (dec) {
        e.preventDefault();
        const card = dec.closest(".bike-gallery-card");
        if (!card) return;
        const cur = Number(card.querySelector(".qty-value")?.textContent || 0);
        setCardQty(card, cur - 1);
        return;
      }

      const rem = e.target.closest(".qty-remove");
      if (rem) {
        e.preventDefault();
        const card = rem.closest(".bike-gallery-card");
        if (!card) return;
        setCardQty(card, 0);
        return;
      }
    });
  }

  // Sync UI to saved cart on load
  function syncCartToUI(root = document) {
    const cart = getCart();
    if (!cart.length) return;
    const cards = $$(".bike-gallery-card", root);
    cart.forEach((item) => {
      const card = cards.find((c) => {
        const id = itemIdFromCard(c);
        return (
          id === item.id || (c.dataset.name && c.dataset.name === item.name)
        );
      });
      if (card) renderQtyControls(card, item.qty);
    });
  }

  // Export for init usage and also auto-run when file loads
  window.__cartHelpers = {
    normalizeCTAs,
    setupAddToCart,
    syncCartToUI,
    renderQtyControls,
    setCardQty,
  };

  // Auto-run when page has bikeSlider
  function autoInitIfNeeded() {
    const track = document.getElementById("bikeSlider");
    if (!track) return;
    normalizeCTAs(track);
    setupAddToCart(document);
    syncCartToUI(document);
  }
  // run now (if DOM already parsed)
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(autoInitIfNeeded, 0);
  } else {
    document.addEventListener("DOMContentLoaded", autoInitIfNeeded);
  }
})();
