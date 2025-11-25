// Improved cart.js — qty controls (+, -, trash) work inside cards and in cart panels
(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  let cart = loadCart();

  function updateCartCount() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    const total = cart.reduce((s, it) => s + (it.qty || 0), 0);
    badge.innerText = total;
  }

  function escapeHtml(s) {
    return String(s || "").replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  }

  function idFromCard(card) {
    if (!card) return null;
    return (
      card.dataset.id ||
      card.dataset.name ||
      card.getAttribute("data-name") ||
      card.querySelector(".bike-name")?.textContent?.trim() ||
      null
    );
  }

  function findCartIdxById(id) {
    return cart.findIndex((i) => i.id === id);
  }

  // render cart list in both small dropdown (#cart-items) and full panel (#cartItems)
  function renderCartDropdown() {
    const list = document.getElementById("cart-items");
    const fullList = document.getElementById("cartItems");
    if (!list && !fullList) return;

    if (list) list.innerHTML = "";
    if (fullList) fullList.innerHTML = "";

    cart.forEach((item, idx) => {
      const img = escapeHtml(item.img || "");
      const name = escapeHtml(item.name || "Item");
      const brand = escapeHtml(item.brand || "");
      const price = item.price ? escapeHtml(String(item.price)) : "";
      const qty = Number(item.qty || 1);

      const row = `
        <div class="cart-row" data-index="${idx}">
          <div class="cart-thumb">
            ${
              img
                ? `<img src="${img}" alt="${name}" />`
                : `<div class="cart-noimg"></div>`
            }
          </div>
          <div class="cart-info">
            <div class="cart-name">${name}</div>
            ${brand ? `<div class="cart-brand">${brand}</div>` : ""}
            ${price ? `<div class="cart-price">${price}</div>` : ""}
            <div class="cart-qty">Qty: ${qty}</div>
          </div>
          <div class="cart-actions">
            <button type="button" class="remove-btn" data-index="${idx}" aria-label="Remove">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>`;

      if (list) list.insertAdjacentHTML("beforeend", row);
      if (fullList) fullList.insertAdjacentHTML("beforeend", row);
    });
  }

  function formatPrice(v) {
    // if numeric string, format rupees; otherwise return original
    const n = Number(String(v).replace(/[^0-9.-]/g, ""));
    if (!isNaN(n) && n !== 0) return "₹" + n.toLocaleString("en-IN");
    return String(v || "");
  }

  // Add item from a product card to cart (used by Add button and by + when not previously in cart)
  function addToCartFromCard(card) {
    if (!card) return;
    const id = idFromCard(card);
    if (!id) return;
    const name =
      card.dataset.name || card.querySelector(".bike-name")?.textContent || id;
    const price = card.dataset.price
      ? formatPrice(card.dataset.price)
      : card.querySelector(".card-price")?.textContent || "";
    const img = card.querySelector("img")?.src || "";
    const brand = card.dataset.brand || "";

    const idx = findCartIdxById(id);
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    } else {
      cart.push({
        id,
        name: String(name).trim(),
        price,
        img,
        brand,
        qty: 1,
      });
    }
    saveCart(cart);
    updateCartCount();
    renderCartDropdown();
  }

  function removeFromCartByIndex(index) {
    if (index < 0 || index >= cart.length) return;
    const removed = cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
    renderCartDropdown();
    // also update any card UI for that item (restore Add button)
    const id = removed[0]?.id;
    if (id) {
      const card = Array.from(
        document.querySelectorAll(".bike-gallery-card")
      ).find((c) => idFromCard(c) === id);
      if (card && window.__cartHelpers?.setCardQty)
        window.__cartHelpers.setCardQty(card, 0);
      else if (card && window.__cartHelpers?.renderQtyControls)
        window.__cartHelpers.renderQtyControls(card, 0);
    }
  }

  // Called when user clicks qty + on a product card
  function incrementOnCard(card) {
    if (!card) return;
    const id = idFromCard(card);
    if (!id) return;
    const idx = findCartIdxById(id);
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    } else {
      // not in cart -> add it with qty 1
      const name =
        card.dataset.name ||
        card.querySelector(".bike-name")?.textContent ||
        id;
      const price = card.dataset.price
        ? formatPrice(card.dataset.price)
        : card.querySelector(".card-price")?.textContent || "";
      const img = card.querySelector("img")?.src || "";
      const brand = card.dataset.brand || "";
      cart.push({ id, name: String(name).trim(), price, img, brand, qty: 1 });
    }
    saveCart(cart);
    updateCartCount();
    renderCartDropdown();
    // update card controls UI
    const newQty = cart[findCartIdxById(id)].qty;
    if (window.__cartHelpers?.setCardQty)
      window.__cartHelpers.setCardQty(card, newQty);
    else {
      const span = card.querySelector(".qty-value");
      if (span) span.textContent = String(newQty);
      else if (window.__cartHelpers?.renderQtyControls)
        window.__cartHelpers.renderQtyControls(card, newQty);
    }
  }

  // Called when user clicks qty - on a product card
  function decrementOnCard(card) {
    if (!card) return;
    const id = idFromCard(card);
    if (!id) return;
    const idx = findCartIdxById(id);
    if (idx < 0) return; // nothing to decrement
    const current = cart[idx].qty || 0;
    const next = current - 1;
    if (next <= 0) {
      // remove
      cart.splice(idx, 1);
      saveCart(cart);
      updateCartCount();
      renderCartDropdown();
      if (window.__cartHelpers?.setCardQty)
        window.__cartHelpers.setCardQty(card, 0);
      else restoreAddButtonSafely(card);
      return;
    }
    cart[idx].qty = next;
    saveCart(cart);
    updateCartCount();
    renderCartDropdown();
    if (window.__cartHelpers?.setCardQty)
      window.__cartHelpers.setCardQty(card, next);
    else {
      const span = card.querySelector(".qty-value");
      if (span) span.textContent = String(next);
    }
  }

  function restoreAddButtonSafely(card) {
    const ctr = card.querySelector(".qty-controls");
    if (ctr) ctr.remove();
    const addBtn = card.querySelector(".bike-btn.add-cart");
    if (addBtn) addBtn.style.display = "";
  }

  // Delegated click handlers for cart and qty controls
  document.addEventListener("click", function (e) {
    // Add to cart button (or its icon)
    const addBtn = e.target.closest(".add-cart");
    if (addBtn) {
      e.preventDefault();
      const card = addBtn.closest(".bike-gallery-card");
      addToCartFromCard(card);
      // show qty-controls in card if module present
      if (window.__cartHelpers?.renderQtyControls)
        window.__cartHelpers.renderQtyControls(card, 1);
      return;
    }

    // qty increment inside product card
    const inc = e.target.closest(".qty-increment");
    if (inc) {
      e.preventDefault();
      const card = inc.closest(".bike-gallery-card");
      incrementOnCard(card);
      return;
    }

    // qty decrement inside product card
    const dec = e.target.closest(".qty-decrement");
    if (dec) {
      e.preventDefault();
      const card = dec.closest(".bike-gallery-card");
      decrementOnCard(card);
      return;
    }

    // qty remove/trash inside product card or cart panel
    const rem = e.target.closest(".qty-remove, .remove-btn");
    if (rem) {
      e.preventDefault();
      // if it's a cart panel remove-btn it carries data-index
      const idxAttr = rem.getAttribute("data-index");
      if (idxAttr !== null) {
        const idx = Number(idxAttr);
        if (!isNaN(idx) && idx >= 0) removeFromCartByIndex(idx);
        return;
      }
      // else it's a card-level trash button
      const card = rem.closest(".bike-gallery-card");
      if (!card) return;
      const id = idFromCard(card);
      const idx2 = findCartIdxById(id);
      if (idx2 >= 0) {
        cart.splice(idx2, 1);
        saveCart(cart);
        updateCartCount();
        renderCartDropdown();
      }
      if (window.__cartHelpers?.setCardQty)
        window.__cartHelpers.setCardQty(card, 0);
      else restoreAddButtonSafely(card);
      return;
    }

    // other cart UI actions (open/close) - keep existing logic
    if (e.target.closest(".cart-icon")) {
      const panel = document.getElementById("cartPanel");
      if (panel) panel.classList.toggle("active");
      return;
    }
    if (e.target.id === "closeCart" || e.target.closest("#closeCart")) {
      const panel = document.getElementById("cartPanel");
      if (panel) panel.classList.remove("active");
      return;
    }
  });

  // init on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    cart = loadCart();
    updateCartCount();
    renderCartDropdown();
    // ensure qty controls in cards reflect persisted cart state
    if (window.__cartHelpers?.syncCartToUI)
      window.__cartHelpers.syncCartToUI(document);
  });
})();
