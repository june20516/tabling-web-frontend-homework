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
  const elementsHasKey = /** @type {HTMLElement} */ (element).querySelectorAll(
    "[key]"
  );
  elementsHasKey.forEach((el) => {
    const key = el.getAttribute("key");
    const value = getValueByKey(key, data);

    el.classList.remove("place-holder-text");
    el.innerHTML = value || "";
  });
};

const getValueByKey = (key, data) => {
  return key?.split(".").reduce((prev, curr, index) => {
    const source = index === 1 ? data : prev;
    return source[curr];
  });
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
