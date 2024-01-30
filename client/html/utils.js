export const setOrderState = (id, status) => {
  const orderId = document.getElementById("order-id");
  const orderStatus = document.getElementById("order-status");

  orderId.innerHTML = id;
  orderStatus.innerHTML = status;
};

export const loadingData = ({ loading, error }) => {
  const content = document.getElementById("loading-content");
  const spinner = document.getElementById("loading-spinner");

  if (error) {
    spinner.style.display = "none";
    content.style.display = "none";
    return;
  }

  if (loading) {
    spinner.style.display = "block";
    content.style.display = "none";
  } else {
    spinner.style.display = "none";
    content.style.display = "block";
  }
};

export const addNotification = (notification) => {
  const notificationPanel = document.getElementById("notifications");

  notificationPanel.style.display = "block";
  notificationPanel.innerHTML = `<span>${notification}</span>`;
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

