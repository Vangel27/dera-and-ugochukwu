document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     ELEMENTS
  ====================================================== */

  const openingScreen = document.getElementById("envelope-screen");
  const envelope = document.getElementById("envelopeBox");
  const openInvitationButton = document.getElementById("openInvitation");
  const openingCountdown = document.getElementById("countdown-display");
  const openingCountdownNumber = document.getElementById("timer-number");
  const envelopePass = document.getElementById("envelopePass");
  const heroSection = document.getElementById("heroSection");
  const invitation = document.getElementById("invitation");

  const replayButton = document.getElementById("replay-invitation");
  const copyAccountNumberButton = document.getElementById("copy-account-number");
  const viewWeddingAlbumButton = document.getElementById("view-wedding-album");
  const guestAlbumModal = document.getElementById("guest-album-modal");
  const guestAlbumGrid = document.getElementById("guest-album-grid");
  const guestAlbumEmpty = document.getElementById("guest-album-empty");

  const music = document.getElementById("weddingMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicCredit = document.getElementById("musicCredit");

  const giftButton = document.getElementById("gift-info-button");
  const giftModal = document.getElementById("gift-modal");
  const bankDetailsToggle = document.getElementById("bank-details-toggle");
  const bankDetailsCard = document.getElementById("bank-details-card");
  const guestPhotoInput = document.getElementById("guest-photo-input");
  const guestPhotoStatus = document.getElementById("guest-photo-status");

  const rsvpButton = document.getElementById("rsvp-button");
  const rsvpModal = document.getElementById("rsvp-modal");
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpSuccess = document.getElementById("rsvp-success");
  const rsvpError = document.getElementById("rsvp-error");

  const galleryLightbox = document.getElementById("gallery-lightbox");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxPrevious = document.getElementById("lightbox-previous");
  const lightboxNext = document.getElementById("lightbox-next");

  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");


  /* =====================================================
     ENVELOPE OPENING
  ====================================================== */

  let openingTransitioning = false;
  let invitationOpened = false;
  let replayInProgress = false;
  let cardRevealTimeout = null;
  let sealTimer = null;
  let sealSecondsRemaining = 3;
  const reduceOpeningMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.body.style.overflow = "hidden";

  function clearSealTimer() {
    if (sealTimer === null) return;
    window.clearInterval(sealTimer);
    sealTimer = null;
  }

  function startSealTimer() {
    clearSealTimer();
    sealSecondsRemaining = 3;
    if (openingCountdownNumber) openingCountdownNumber.textContent = String(sealSecondsRemaining);
    if (openingCountdown) openingCountdown.hidden = false;

    sealTimer = window.setInterval(() => {
      sealSecondsRemaining -= 1;
      if (openingCountdownNumber) openingCountdownNumber.textContent = String(sealSecondsRemaining);
      if (sealSecondsRemaining <= 0) {
        clearSealTimer();
        openEnvelope();
      }
    }, 1000);
  }

  function openEnvelope() {
    clearSealTimer();
    if (openingCountdown) openingCountdown.hidden = true;
    if (openingTransitioning || invitationOpened || !openingScreen || !envelope || !openInvitationButton) return;
    if (envelope.classList.contains("opened")) return;
    openingTransitioning = true;
    openInvitationButton.disabled = true;
    envelope.classList.add("opened");

    cardRevealTimeout = window.setTimeout(() => {
      envelope.classList.add("card-emerging");
      cardRevealTimeout = null;
      openingTransitioning = false;
    }, reduceOpeningMotion ? 20 : 820);
  }

  function enterWebsite() {
    if (invitationOpened || !openingScreen || !invitation || !envelope || !envelope.classList.contains("opened")) return;
    // This transition runs from the guest's button click, allowing playback
    // under browser user-gesture policies.
    if (music && music.paused) startMusicFromOpening();
    invitationOpened = true;
    openingTransitioning = true;
    openingScreen.classList.add("is-leaving");
    invitation.classList.remove("hidden");
    invitation.classList.add("is-entering");
    if (heroSection) heroSection.style.display = "block";

    window.setTimeout(() => {
      openingScreen.hidden = true;
      document.body.style.overflow = "auto";
      window.dispatchEvent(new CustomEvent("invitationOpened"));
      showToast("Welcome to Dera & Ugochukwu's wedding");
      openingTransitioning = false;

      if (heroSection) {
        heroSection.scrollIntoView({
          behavior: reduceOpeningMotion ? "auto" : "smooth",
          block: "start"
        });
      }
    }, reduceOpeningMotion ? 20 : 700);
  }

  if (openInvitationButton) openInvitationButton.addEventListener("click", openEnvelope);
  if (envelopePass) {
    envelopePass.addEventListener("click", (event) => {
      event.stopPropagation();
      const openPassButton = event.target.closest(".open-pass-btn");
      if (!openPassButton) return;
      if (!envelope || !envelope.classList.contains("card-emerging")) return;
      if (invitationOpened) return;
      enterWebsite();
    });
  }

  startSealTimer();

  function replayEnvelopeOpening() {
    if (openingTransitioning || replayInProgress) return;
    replayInProgress = true;
    if (replayButton) replayButton.disabled = true;

    const resetOpening = () => {
      const openPassButton = envelopePass && envelopePass.querySelector(".open-pass-btn");
      if (openPassButton) {
        openPassButton.disabled = false;
      }
      if (invitation) {
        invitation.classList.remove("is-entering", "is-replaying");
        invitation.classList.add("hidden");
      }
      if (openingScreen) {
        openingScreen.hidden = false;
        openingScreen.classList.remove("is-leaving", "hidden");
      }
      if (cardRevealTimeout) {
        window.clearTimeout(cardRevealTimeout);
        cardRevealTimeout = null;
      }
      clearSealTimer();
      if (envelope) envelope.classList.remove("opened", "card-emerging");
      if (heroSection) heroSection.style.display = "none";
      if (openInvitationButton) openInvitationButton.disabled = false;
      invitationOpened = false;
      openingTransitioning = false;
      replayInProgress = false;
      if (replayButton) replayButton.disabled = false;
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
      if (openInvitationButton) openInvitationButton.focus({ preventScroll: true });
      startSealTimer();
    };

    if (invitationOpened && invitation) {
      invitation.classList.remove("is-entering");
      invitation.classList.add("is-replaying");
      window.setTimeout(resetOpening, reduceOpeningMotion ? 20 : 550);
    } else {
      resetOpening();
    }
  }

  if (replayButton) replayButton.addEventListener("click", replayEnvelopeOpening);


  /* =====================================================
     COUNTDOWN
  ====================================================== */

  const weddingDate =
    new Date("2027-01-04T12:00:00+01:00").getTime();

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const countdownGrid = document.querySelector(".countdown-grid");
  let countdownInterval;

  function updateCountdown() {

    const now = Date.now();
    const distance = weddingDate - now;

    if (distance <= 0) {

      clearInterval(countdownInterval);
      countdownGrid.replaceChildren();

      const completionMessage = document.createElement("p");
      completionMessage.className = "countdown-complete";
      completionMessage.setAttribute("role", "status");
      completionMessage.setAttribute("aria-live", "polite");
      completionMessage.textContent = "THE DAY IS HERE";
      countdownGrid.appendChild(completionMessage);
      countdownGrid.setAttribute("aria-label", "The wedding day is here");

      return false;
    }

    const days =
      Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours =
      Math.floor(
        (distance / (1000 * 60 * 60)) % 24
      );

    const minutes =
      Math.floor(
        (distance / (1000 * 60)) % 60
      );

    const seconds =
      Math.floor(
        (distance / 1000) % 60
      );


    updateNumber(daysEl, days);
    updateNumber(hoursEl, hours);
    updateNumber(minutesEl, minutes);
    updateNumber(secondsEl, seconds);

    return true;
  }


  function updateNumber(element, value) {

    const formatted =
      String(value).padStart(2, "0");

    if (element.textContent !== formatted) {

      element.textContent = formatted;

      element.classList.remove("tick");

      void element.offsetWidth;

      element.classList.add("tick");

    }

  }


  if (daysEl && hoursEl && minutesEl && secondsEl && countdownGrid && updateCountdown()) {
    countdownInterval = setInterval(updateCountdown, 1000);
  }


  /* =====================================================
     MUSIC
  ====================================================== */

  const musicSource = music && music.querySelector("source");
  let musicAvailable = false;
  let musicFailed = false;
  let musicPlayPending = false;
  if (music) {
    music.loop = true;
    music.volume = 0.6;
    music.preload = "metadata";
  }

  function syncMusicControl() {
    if (!music || !musicToggle) return;

    const playing = !music.paused && !music.ended;
    const icon = musicToggle.querySelector(".music-note");
    const label = document.getElementById("musicLabel");

    musicToggle.classList.toggle("is-playing", playing);
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute(
      "aria-label",
      playing ? "Pause wedding music" : "Play wedding music"
    );

    if (icon) {
      icon.textContent = playing ? "\u266b" : "\u266a";
    }

    if (label) {
      label.textContent = playing ? "Pause music" : "Play music";
    }
  }

  function showMusicControl() {
    if (musicFailed || !musicToggle) return;

    musicAvailable = true;
    musicToggle.hidden = false;
    if (musicCredit) musicCredit.hidden = false;
    syncMusicControl();
  }

  function hideMusicControl() {
    musicAvailable = false;
    musicFailed = true;
    if (musicCredit) musicCredit.hidden = true;
    if (!musicToggle) return;

    musicToggle.hidden = true;
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Play wedding music");
  }

  function startMusicFromOpening() {
    if (!music || !musicSource || musicFailed || !music.paused || musicPlayPending) return;

    try {
      const playRequest = music.play();

      if (playRequest && typeof playRequest.then === "function") {
        musicPlayPending = true;
        playRequest.then(() => {
          musicPlayPending = false;
        }).catch(() => {
          musicPlayPending = false;
          syncMusicControl();
        });
      }
    } catch {
      musicPlayPending = false;
      syncMusicControl();
    }
  }

  if (music) {
    music.addEventListener("canplay", showMusicControl);
    music.addEventListener("playing", () => {
      musicPlayPending = false;
      showMusicControl();
    });
    music.addEventListener("play", syncMusicControl);
    music.addEventListener("pause", syncMusicControl);
    music.addEventListener("ended", syncMusicControl);
    music.addEventListener("error", hideMusicControl);
  }

  if (musicToggle) musicToggle.addEventListener("click", async () => {
    if (!musicAvailable) return;

    try {
      if (music.paused || music.ended) {
        if (music.ended) {
          music.currentTime = 0;
        }

        await music.play();
      } else {
        music.pause();
      }
    } catch {
      syncMusicControl();
    }
  });

  if (music && musicSource) {
    music.load();
  } else {
    hideMusicControl();
  }


  /* =====================================================
     ACCESSIBLE MODALS AND RSVP
  ====================================================== */

  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let activeLayer = null;
  let layerTrigger = null;
  let previousBodyOverflow = "";

  function openLayer(layer, trigger) {
    if (!layer) return;

    if (!activeLayer) {
      previousBodyOverflow = document.body.style.overflow;
    } else {
      activeLayer.classList.add("hidden");
    }

    activeLayer = layer;
    layerTrigger = trigger || document.activeElement;
    layer.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    const firstControl = getFocusable(layer)[0];
    (firstControl || layer).focus();
  }

  function getFocusable(layer) {
    return Array.from(layer.querySelectorAll(focusableSelector))
      .filter(element => element.getClientRects().length > 0);
  }

  function closeLayer(layer = activeLayer) {
    if (!layer) return;

    layer.classList.add("hidden");
    if (layer !== activeLayer) return;

    if (layer === rsvpModal && rsvpForm && rsvpSuccess) {
      rsvpForm.reset();
      rsvpForm.classList.remove("hidden");
      rsvpSuccess.classList.add("hidden");
      if (rsvpError) rsvpError.textContent = "";
    }

    activeLayer = null;
    document.body.style.overflow = previousBodyOverflow;

    if (layerTrigger && typeof layerTrigger.focus === "function") {
      layerTrigger.focus();
    }
    layerTrigger = null;
  }

  if (giftButton && giftModal) {
    giftButton.addEventListener("click", () => openLayer(giftModal, giftButton));
  }

  if (bankDetailsToggle && bankDetailsCard) {
    bankDetailsToggle.addEventListener("click", () => {
      const willShow = bankDetailsCard.hidden;
      bankDetailsCard.hidden = !willShow;
      bankDetailsToggle.setAttribute("aria-expanded", String(willShow));
      bankDetailsToggle.textContent = willShow
        ? "Hide bank transfer details"
        : "Show bank transfer details";
    });
  }

  if (copyAccountNumberButton) {
    copyAccountNumberButton.addEventListener("click", async () => {
      const accountNumber = "2047934030";

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(accountNumber);
        } else {
          throw new Error("Clipboard API unavailable in this context.");
        }
      } catch {
        const temporaryField = document.createElement("textarea");
        temporaryField.value = accountNumber;
        temporaryField.setAttribute("readonly", "");
        temporaryField.style.position = "fixed";
        temporaryField.style.opacity = "0";
        document.body.append(temporaryField);
        temporaryField.select();
        const copied = document.execCommand("copy");
        temporaryField.remove();
        if (!copied) {
          showToast("Could not copy the account number.");
          return;
        }
      }

      showToast("Copied!");
    });
  }

  if (viewWeddingAlbumButton && guestAlbumModal) {
    viewWeddingAlbumButton.addEventListener("click", event => {
      event.preventDefault();
      openLayer(guestAlbumModal, viewWeddingAlbumButton);
      fetchCloudinaryGallery();
    });
  }

  if (rsvpButton && rsvpModal) {
    rsvpButton.addEventListener("click", () => openLayer(rsvpModal, rsvpButton));
  }

  document.querySelectorAll("[data-modal-dismiss]").forEach(button => {
    button.addEventListener("click", () => {
      const layer = button.closest(".modal");
      closeLayer(layer);
    });
  });

  if (rsvpForm && rsvpModal && rsvpSuccess) {
    const nameField = document.getElementById("guest-name");
    const attendanceField = document.getElementById("attendance");
    const guestCountField = document.getElementById("guest-count");
    const wishOptionField = document.getElementById("wish-option");
    const messageField = document.getElementById("guest-message");
    const successTitle = document.getElementById("rsvp-success-title");
    const submitButton = document.getElementById("submit-btn");

    if (nameField) nameField.addEventListener("input", () => nameField.setCustomValidity(""));

    rsvpForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (!nameField || !attendanceField || !guestCountField || !successTitle) return;

      const guestName = nameField.value.trim();
      nameField.setCustomValidity(guestName ? "" : "Please enter your full name.");
      if (!rsvpForm.checkValidity()) {
        rsvpForm.reportValidity();
        return;
      }
      nameField.setCustomValidity("");

      const customMessage = messageField ? messageField.value.trim() : "";
      const selectedWish = wishOptionField ? wishOptionField.value : "";
      const formValues = Object.fromEntries(new FormData(rsvpForm).entries());
      formValues.subject = "New Wedding RSVP - Dera & Ugochukwu";
      formValues.custom_message = customMessage || selectedWish;
      delete formValues.message;

      const originalButtonText = submitButton ? submitButton.textContent : "Submit RSVP";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }
      if (rsvpError) rsvpError.textContent = "";

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(rsvpForm.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formValues),
          signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
          throw new Error(result.message || "The RSVP could not be confirmed.");
        }

        rsvpForm.classList.add("hidden");
        rsvpSuccess.classList.remove("hidden");
        successTitle.textContent = "Thank You!";
        const successMessage = document.getElementById("rsvp-success-message");
        if (successMessage) successMessage.textContent = "Your RSVP has been submitted successfully.";
        successTitle.focus();
      } catch (error) {
        if (rsvpError) {
          rsvpError.textContent = error.name === "AbortError"
            ? "The request timed out. Please check your connection and try again."
            : "We couldn't confirm your RSVP. Please check your connection and try again.";
          rsvpError.focus();
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }


  /* =====================================================
     GALLERY LIGHTBOX
  ====================================================== */

  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  let activeGalleryIndex = 0;

  function showGalleryItem(index) {
    if (!galleryItems.length || !lightboxCaption || !lightboxImage) return;

    activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeGalleryIndex];
    const caption = item.dataset.caption || item.textContent.trim() || "Wedding memory";
    const image = item.querySelector("img");

    lightboxCaption.textContent = caption;
    if (image) {
      lightboxImage.src = image.getAttribute("src");
      lightboxImage.alt = image.alt;
    }
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      showGalleryItem(index);
      openLayer(galleryLightbox, item);
    });
  });

  const cloudinaryName = "pbz0jtv4";
  const cloudinaryUploadPreset = "o1bjynky";
  const cloudinaryAlbumTag = "dera-ugochukwu-guest-album";
  const guestAlbumStorageKey = "dera_ugochukwu_global_album";
  const hiddenAlbumPhotosStorageKey = "dera_ugochukwu_hidden_album_photos";

  function getPhotoPublicIdFromUrl(url) {
    try {
      const pathname = new URL(url).pathname;
      const uploadMarker = "/image/upload/";
      const uploadIndex = pathname.indexOf(uploadMarker);
      if (uploadIndex < 0) return url;
      let publicId = pathname.slice(uploadIndex + uploadMarker.length);
      publicId = publicId.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
      return decodeURIComponent(publicId);
    } catch {
      return url;
    }
  }

  function getHiddenAlbumPhotoIds() {
    try {
      const storedIds = JSON.parse(localStorage.getItem(hiddenAlbumPhotosStorageKey) || "[]");
      return new Set(Array.isArray(storedIds) ? storedIds.filter(id => typeof id === "string") : []);
    } catch {
      return new Set();
    }
  }

  function getStoredGuestPhotos() {
    try {
      const savedPhotos = JSON.parse(localStorage.getItem(guestAlbumStorageKey) || "[]");
      return Array.isArray(savedPhotos)
        ? savedPhotos.filter(photo => typeof photo === "string" && photo.startsWith("https://"))
        : [];
    } catch (error) {
      console.warn("Saved guest album could not be read.", error);
      return [];
    }
  }

  function renderGuestAlbum(photoUrls) {
    if (!guestAlbumGrid) return;
    const hiddenPhotoIds = getHiddenAlbumPhotoIds();
    const normalizedPhotos = photoUrls.map(photo => typeof photo === "string"
      ? { url: photo, publicId: getPhotoPublicIdFromUrl(photo) }
      : photo
    ).filter(photo => photo && typeof photo.url === "string" && photo.url.startsWith("https://"));
    const uniquePhotos = Array.from(new Map(
      normalizedPhotos.map(photo => [photo.publicId || photo.url, photo])
    ).values());
    const photos = uniquePhotos.filter(photo => !hiddenPhotoIds.has(photo.publicId || photo.url));
    guestAlbumGrid.replaceChildren();

    photos.forEach((photo, index) => {
      const item = document.createElement("figure");
      item.className = "guest-album-photo";
      item.dataset.publicId = photo.publicId || photo.url;

      const image = document.createElement("img");
      image.src = photo.url;
      image.alt = `Guest-uploaded wedding photo ${index + 1}`;
      image.loading = "lazy";
      image.decoding = "async";

      const caption = document.createElement("figcaption");
      caption.textContent = "Guest Photo";

      const actions = document.createElement("div");
      actions.className = "guest-album-photo-actions";
      const downloadLink = document.createElement("a");
      downloadLink.className = "btn-download";
      downloadLink.href = photo.url.replace("/image/upload/", "/image/upload/fl_attachment/");
      downloadLink.download = `Dera-Ugochukwu-Wedding-Guest-${index + 1}.jpg`;
      downloadLink.textContent = "Download Photo";
      downloadLink.setAttribute("aria-label", `Download guest wedding photo ${index + 1}`);
      downloadLink.target = "_blank";
      downloadLink.rel = "noopener noreferrer";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-btn";
      deleteButton.textContent = "Delete Photo";
      deleteButton.setAttribute("aria-label", `Remove guest wedding photo ${index + 1} from this browser's album view`);
      actions.append(downloadLink, deleteButton);

      item.append(image, caption, actions);
      guestAlbumGrid.appendChild(item);
    });

    if (guestAlbumEmpty) guestAlbumEmpty.hidden = photos.length > 0;
  }

  async function fetchCloudinaryGallery() {
    if (!guestAlbumGrid) return;

    try {
      const listingUrl = `https://res.cloudinary.com/${cloudinaryName}/image/list/${cloudinaryAlbumTag}.json`;
      const response = await fetch(`${listingUrl}?_=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Cloudinary album listing returned ${response.status}.`);

      const listing = await response.json();
      const remotePhotos = Array.isArray(listing.resources)
        ? listing.resources
          .filter(resource => resource && resource.public_id && resource.format)
          .map(resource => {
            const version = resource.version ? `v${resource.version}/` : "";
            return {
              url: `https://res.cloudinary.com/${cloudinaryName}/image/upload/${version}${resource.public_id}.${resource.format}`,
              publicId: resource.public_id
            };
          })
        : [];

      renderGuestAlbum([...remotePhotos, ...getStoredGuestPhotos()]);
      if (guestAlbumModal && !guestAlbumModal.classList.contains("hidden") && guestPhotoStatus) {
        guestPhotoStatus.textContent = "Shared Cloudinary album refreshed.";
      }
    } catch (error) {
      console.warn("Cloudinary's public album listing is unavailable; showing this browser's saved uploads.", error);
      renderGuestAlbum(getStoredGuestPhotos());
      if (guestPhotoStatus) {
        guestPhotoStatus.textContent = "The shared album is temporarily unavailable. You can still upload a photo, and the album will refresh when it is reachable.";
      }
    }
  }

  async function uploadGuestPhoto(file) {
    if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) {
      throw new Error("Choose an image smaller than 20 MB.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);
    formData.append("tags", cloudinaryAlbumTag);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
      { method: "POST", body: formData }
    );
    const result = await response.json();
    if (!response.ok || !result.secure_url) {
      throw new Error(result.error?.message || "Cloudinary could not upload this photo.");
    }

    const savedPhotos = getStoredGuestPhotos();
    if (!savedPhotos.includes(result.secure_url)) {
      savedPhotos.unshift(result.secure_url);
      try {
        localStorage.setItem(guestAlbumStorageKey, JSON.stringify(savedPhotos));
      } catch (error) {
        console.warn("The Cloudinary upload succeeded, but its URL could not be saved in this browser.", error);
      }
    }
    renderGuestAlbum([
      { url: result.secure_url, publicId: result.public_id || getPhotoPublicIdFromUrl(result.secure_url) },
      ...savedPhotos
    ]);
  }

  if (guestAlbumGrid) {
    guestAlbumGrid.addEventListener("click", event => {
      const deleteButton = event.target.closest(".delete-btn");
      if (!deleteButton) return;

      const photoCard = deleteButton.closest(".guest-album-photo");
      const publicId = photoCard && photoCard.dataset.publicId;
      if (!publicId || !window.confirm("Remove this photo from this browser's album view? The Cloudinary original will remain in shared storage.")) return;

      const hiddenPhotoIds = getHiddenAlbumPhotoIds();
      hiddenPhotoIds.add(publicId);
      try {
        localStorage.setItem(hiddenAlbumPhotosStorageKey, JSON.stringify(Array.from(hiddenPhotoIds)));
        photoCard.remove();
        if (guestAlbumEmpty && !guestAlbumGrid.querySelector(".guest-album-photo")) {
          guestAlbumEmpty.hidden = false;
          guestAlbumEmpty.textContent = "No photos are visible in this browser's album view.";
        }
      } catch (error) {
        console.error("Could not save the local album view preference.", error);
        showToast("This photo could not be removed from the album view.");
      }
    });
  }

  fetchCloudinaryGallery();

  if (guestPhotoInput && guestAlbumGrid) {
    guestPhotoInput.addEventListener("change", async event => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;

      let uploaded = 0;
      const errors = [];
      guestPhotoInput.disabled = true;

      for (const file of files) {
        if (guestPhotoStatus) guestPhotoStatus.textContent = `Uploading ${file.name} to Cloudinary...`;
        try {
          await uploadGuestPhoto(file);
          uploaded += 1;
        } catch (error) {
          errors.push(error.message);
        }
      }

      guestPhotoInput.disabled = false;
      guestPhotoInput.value = "";
      if (guestPhotoStatus) {
        guestPhotoStatus.textContent = uploaded
          ? `${uploaded} photo${uploaded === 1 ? "" : "s"} uploaded to Cloudinary and added to this browser's album.${errors.length ? ` ${errors.length} photo${errors.length === 1 ? "" : "s"} failed.` : ""}`
          : errors[0] || "No photos were uploaded.";
      }
      if (uploaded) {
        showToast(`${uploaded} photo${uploaded === 1 ? "" : "s"} uploaded to the wedding album.`);
        fetchCloudinaryGallery();
      }
      if (errors.length) console.error("One or more wedding photo uploads failed:", errors);
    });
  }

  if (lightboxPrevious) {
    lightboxPrevious.addEventListener("click", () => showGalleryItem(activeGalleryIndex - 1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => showGalleryItem(activeGalleryIndex + 1));
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => closeLayer(galleryLightbox));
  }

  if (galleryLightbox) {
    galleryLightbox.addEventListener("click", event => {
      if (event.target === galleryLightbox) closeLayer(galleryLightbox);
    });
  }

  document.addEventListener("keydown", event => {
    if (!activeLayer) return;

    if (event.key === "Escape") {
      closeLayer(activeLayer);
      return;
    }

    if (activeLayer === galleryLightbox && event.key === "ArrowRight") {
      event.preventDefault();
      showGalleryItem(activeGalleryIndex + 1);
    } else if (activeLayer === galleryLightbox && event.key === "ArrowLeft") {
      event.preventDefault();
      showGalleryItem(activeGalleryIndex - 1);
    }

    if (event.key === "Tab") {
      const focusable = getFocusable(activeLayer);
      if (!focusable.length) {
        event.preventDefault();
        activeLayer.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });


  /* =====================================================
     TOAST
  ====================================================== */

  let toastTimer;

  function showToast(message) {
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

      toast.classList.remove("show");

    }, 3000);

  }


  /* =====================================================
     INITIAL BODY STATE
  ====================================================== */

  document.body.style.overflow = "hidden";


  /* =====================================================
     EVENT FOR FUTURE FEATURES
  ====================================================== */

  window.addEventListener(
    "invitationOpened",
    () => {

      console.log(
        "Wedding invitation opened successfully."
      );

    }
  );

});
