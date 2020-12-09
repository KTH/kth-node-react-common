/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const React = require("react");
const PropTypes = require("prop-types");

const { observer } = require("../../FormHelpers/node_modules/mobx-react");
const { getStoreState, useStore } = require("../MobxUtils");
const { isNoObject } = require("../utils");

const ComponentExport = observer(Breadcrumbs);
module.exports = ComponentExport;

const propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
};

const defaultProps = {
  items: [],
};

/**
 * `<Breadcrumbs />`
 *
 * @param {object} props
 * @param {object} [props.items]
 */
function Breadcrumbs(props) {
  const { items } = props;

  const { basicBreadcrumbs, language } =
    getStoreState("default") === "active"
      ? useStore("default")
      : { basicBreadcrumbs: [], language: "en" };

  ensureItemsAreValid(items);

  if (basicBreadcrumbs.length === 0 && items.length === 0) {
    return null;
  }

  const _turnItemIntoBreadcrumb = ({ label, url }, index) => (
    <li key={`${label}-${index}`} className="breadcrumb-item">
      <a href={url}>{label}</a>
    </li>
  );

  const ariaLabel = language === "sv" ? "Brödsmulor" : "Breadcrumbs";

  return (
    <div className="container articleNavigation">
      <nav id="breadcrumbs" aria-label={ariaLabel}>
        <ol className="breadcrumb">
          {basicBreadcrumbs.map(_turnItemIntoBreadcrumb)}
          {items.map(_turnItemIntoBreadcrumb)}
        </ol>
      </nav>
    </div>
  );
}

Breadcrumbs.propTypes = propTypes;
Breadcrumbs.defaultProps = defaultProps;
ComponentExport.propTypes = propTypes;
ComponentExport.defaultProps = defaultProps;

function ensureItemsAreValid(items) {
  if (!Array.isArray(items) || items.some(isNoObject)) {
    throw new Error(
      '<Breadcrumbs/> failed - invalid prop "items", expected object[]'
    );
  }
  if (
    items.some(
      ({ label, url }) =>
        typeof label !== "string" ||
        label === "" ||
        typeof url !== "string" ||
        url === ""
    )
  ) {
    throw new Error(
      '<Breadcrumbs/> failed - invalid prop "items", expected array of { label, url }'
    );
  }
}
