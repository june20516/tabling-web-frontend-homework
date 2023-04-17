// @ts-check

// @ts-ignore
const host = import.meta.env.VITE_HOST;

const get = (path) => {
  const url = new URL(path, host);
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const getReservationData = async () => {
  return await get("/v1/store/9533/reservations").then((data) => data.json());
};

const renderReservationList = (reservations) => {
  const listContainer = document.getElementById("reservation-list");
  reservations.map((reservation) => {
    listContainer?.appendChild(reservationListItem(reservation));
  });
  return listContainer;
};

const reservationListItem = (reservation) => {
  const newListItem = getNewElementBytemplate(".list-item");
  injectData(newListItem, reservation);
  return newListItem;
};

/**
 * @param element {HTMLElement}
 * @param data {object}
 */
const injectData = (element, data) => {
  const elementsHasKey = /** @type {NodeListOf<HTMLElement>} */ (
    /** @type {HTMLElement} */ (element).querySelectorAll("[key]")
  );
  elementsHasKey.forEach((el) => {
    const key = el.getAttribute("key");
    const value = getValueByKey(key, data);

    if (value instanceof Array) {
      value.forEach((subValue) => {
        const newElement = el.cloneNode(true);
        el.parentElement?.appendChild(newElement);
        injectData(/** @type {HTMLElement} */ (newElement), subValue);
      });
      el.remove();
      return;
    }
    el.classList.remove("place-holder-text");
    moderateStyle(el, key, value);
    el.innerHTML = moderateValue(key, value) || "";
  });
};

const moderateStyle = (el, key, value) => {
  function findAncestorByClassName(el, className) {
    while ((el = el.parentNode) && !el.classList.contains(className));
    return el;
  }
  switch (key) {
    case "reservations.status":
      const listItem = findAncestorByClassName(el, "list-item");
      const actionButtonText = listItem.querySelector(".actions button span");
      console.log(listItem);
      if (value === "done") {
        listItem.classList.add("hidden");
      } else if (value === "seated") {
        el.style.color = "#162149";
        if (actionButtonText) {
          actionButtonText.innerHTML = "퇴석";
          actionButtonText.classList.remove("place-holder-text");
        }
      } else if (value === "reserved") {
        el.style.color = "#3BB94C";
        if (actionButtonText) {
          actionButtonText.innerHTML = "착석";
          actionButtonText.classList.remove("place-holder-text");
        }
      }
      break;
  }
};

const moderateValue = (key, value) => {
  switch (key) {
    case "reservations.timeReserved":
      const time = new Date(value);
      return `${time.getHours().toString().padStart(2, "0")}:${time
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    case "reservations.status":
      const displayStatus = { seated: "착석중", reserved: "예약" };
      return displayStatus[value] || value;
    case "reservations.customer.adult":
      return value ? `성인 ${value}` : "";
    case "reservations.customer.child":
      return value ? `아이 ${value}` : "";
    default:
      return value;
  }
};

const getValueByKey = (key, data) => {
  const keySequence = key?.split(".");
  return keySequence.length > 1
    ? keySequence.reduce((prev, curr, index, arr) => {
        let k = curr;
        if (k.endsWith("[]")) {
          arr.splice(index + 1);
          k = k.slice(0, -2);
        }
        const source = index === 1 ? data : prev;
        return source[k];
      })
    : data[keySequence[0]];
};

/**
 *
 * @param {string} selector
 * @returns {HTMLElement}
 */
const getNewElementBytemplate = (selector) => {
  const template = document.querySelector(`${selector}.template`);
  if (!template) throw new Error("Cannot find HTMLElement template");
  const newElement = /** @type {HTMLElement } */ (template.cloneNode(true));
  newElement.classList.remove("template");

  return newElement;
};

getReservationData().then((data) => renderReservationList(data.reservations));
