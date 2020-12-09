/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const { isNoObject } = require("../utils");

const createDefaultStore = require("./defaultStore");

const { createStoreManager, getStoreManager } = require("./manager");

module.exports = {
  announceStore,
  createStore,
  createMultiStore,
  getStoreState,
};

/**
 * Prepares the later usage of the MobX-store with the given ID
 *
 * Please note: This function can also be used to replace
 *    the default store which comes with this package.
 *
 * @param {string} storeId
 * @param {() => object} initCallback
 */
function announceStore(storeId, initCallback) {
  if (typeof initCallback === "function") {
    createStoreManager(storeId, initCallback);
  }
}

/**
 * @param {string} [storeId]
 *      e.g. "program"
 * @param {object} [defaultStore]
 *    already prepared default store which shall be injected into new store
 *
 * @throws
 * @returns {object}
 *    raw single store data w/o MobX
 */
function createStore(storeId = "default", defaultStore = null) {
  try {
    const storeData = _prepareStoreDataWithInitCallback({
      storeId,
      defaultStoreData: defaultStore,
    });

    return storeData;
  } catch (error) {
    error.message = `createStore() failed - ${error.message}`;
    throw error;
  }
}

/**
 * @param {string[]} [storeIdList]
 *    List of needed additional stores
 *    (default store is always included)
 *      e.g. ["program"]
 *
 * @throws
 * @returns {object}
 *    raw multi store data w/o MobX
 *    with shape { multiStore: true, default: <store data>, ... }
 *      e.g. { multiStore: true, default: <store data>, program: <store data> }
 */
function createMultiStore(...storeIdList) {
  try {
    const defaultStoreData = _prepareStoreDataWithInitCallback({
      storeId: "default",
    });

    const result = {
      multiStore: true,
      default: defaultStoreData,
    };

    storeIdList.forEach((storeId) => {
      result[storeId] = _prepareStoreDataWithInitCallback({
        storeId,
        defaultStoreData,
      });
    });

    return result;
  } catch (error) {
    error.message = `createMultiStore() failed - ${error.message}`;
    throw error;
  }
}

/**
 * @param {object} inputBag
 * @param {string} inputBag.storeId
 * @param {object} [inputBag.defaultStoreData]
 *
 * @returns {object}
 */
function _prepareStoreDataWithInitCallback({
  storeId,
  defaultStoreData = null,
}) {
  const defaultStoreMustStillBeAnnounced =
    storeId === "default" && getStoreManager("default") == null;
  if (defaultStoreMustStillBeAnnounced) {
    createStoreManager("default", createDefaultStore);
  }

  const manager = getStoreManager(storeId);
  if (manager == null) {
    throw new Error(
      `unknown store "${storeId}", remember to announce it first`
    );
  }

  const initCallback = manager.getInitCallback();
  if (typeof initCallback !== "function") {
    throw new Error(`missing init-callback (store "${storeId}")`);
  }

  const storeData = initCallback(defaultStoreData);
  if (isNoObject(storeData)) {
    throw new Error(`invalid init-callback - expected to return an object`);
  }

  return storeData;
}

/**
 * @param {string} [storeId]
 *
 * @returns {string|null}
 *    null if store not announced, yet; or
 *    "pending" if store announced but not initialized; or
 *    "active" if store announced and initialized
 */
function getStoreState(storeId = "default") {
  const manager = getStoreManager(storeId);
  if (manager == null) {
    return null;
  }

  const isActive = manager.checkIfIsActive();
  return isActive ? "active" : "pending";
}
