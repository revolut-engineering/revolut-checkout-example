export const addNotification = (notification) => {
  const notificationPanel = document.getElementById("notifications");

  notificationPanel.style.display = "block";
  notificationPanel.innerHTML = `<span>${notification}</span>`;
};

export const addModalNotification = (title, notification) => {
  const overlay = document.getElementById("overlay");
  const popupContent = document.getElementById("popup-content");

  overlay.style.display = "flex";
  popupContent.innerHTML = `<h2>${title}</h2><span>${notification}</span>`;
};

export const staticProduct = {
  currency: "USD",
  amount: 57,
  name: "Rounded Glasses",
};

const categoryElements = document.querySelectorAll(".sidebar .category");

categoryElements.forEach(function (category) {
  category.addEventListener("click", function () {
    category.classList.toggle("active");
  });
});

const modalCloseButton = document.getElementById("close-btn");
const modalDoneButton = document.getElementById("done-btn");

if (modalCloseButton) {
  modalCloseButton.addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
  });
}

if (modalDoneButton) {
  modalDoneButton.addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
  });
}
