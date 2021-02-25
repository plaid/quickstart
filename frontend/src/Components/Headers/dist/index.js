"use strict";
exports.__esModule = true;
var react_1 = require("react");
var Note_1 = require("plaid-threads/Note");
var InlineLink_1 = require("plaid-threads/InlineLink");
var Link_1 = require("../Link");
var Context_1 = require("../../Context");
var index_module_scss_1 = require("./index.module.scss");
var Header = function () {
    var _a = react_1.useContext(Context_1["default"]), itemId = _a.itemId, accessToken = _a.accessToken, linkToken = _a.linkToken, linkSuccess = _a.linkSuccess, isItemAccess = _a.isItemAccess;
    return (react_1["default"].createElement("div", { className: index_module_scss_1["default"].grid },
        react_1["default"].createElement("h3", { className: index_module_scss_1["default"].title }, "Plaid Quickstart"),
        !linkSuccess ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("h4", { className: index_module_scss_1["default"].subtitle }, "A sample end-to-end integration with Plaid"),
            react_1["default"].createElement("p", { className: index_module_scss_1["default"].introPar }, "The Plaid flow begins when your user wants to connect their bank account to your app. Simulate this by clicking the button below to launch Link - the client-side component that your users will interact with in order to link their accounts to Plaid and allow you to access their accounts via the Plaid API."),
            linkToken == null ? (react_1["default"].createElement(Note_1["default"], { error: true, solid: true, className: index_module_scss_1["default"].error }, "Unable to fetch link_token: please make sure your backend server is running and that your .env file has been configured with your PLAID_CLIENT_ID and PLAID_SECRET.")) :
                linkToken === "" ? (react_1["default"].createElement("div", { className: index_module_scss_1["default"].linkButton },
                    react_1["default"].createElement(Note_1["default"], null, "Loading..."))) :
                    (react_1["default"].createElement("div", { className: index_module_scss_1["default"].linkButton },
                        react_1["default"].createElement(Link_1["default"], null))))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
            isItemAccess ? (react_1["default"].createElement("h4", { className: index_module_scss_1["default"].subtitle },
                "Congrats! By linking an account, you have created an",
                " ",
                react_1["default"].createElement(InlineLink_1["default"], { href: "http://plaid.com/docs/quickstart/glossary/#item", target: "_blank" }, "Item"),
                ".")) : (react_1["default"].createElement("h4", { className: index_module_scss_1["default"].subtitle },
                react_1["default"].createElement(Note_1["default"], { error: true, solid: true, className: index_module_scss_1["default"].error }, "Unable to create an item. Please check your backend server"))),
            react_1["default"].createElement("div", { className: index_module_scss_1["default"].itemAccessContainer },
                react_1["default"].createElement("p", { className: index_module_scss_1["default"].itemAccessRow },
                    react_1["default"].createElement("span", { className: index_module_scss_1["default"].idName }, "item_id"),
                    react_1["default"].createElement("span", { className: index_module_scss_1["default"].tokenText }, itemId)),
                react_1["default"].createElement("p", { className: index_module_scss_1["default"].itemAccessRow },
                    react_1["default"].createElement("span", { className: index_module_scss_1["default"].idName }, "access_token"),
                    react_1["default"].createElement("span", { className: index_module_scss_1["default"].tokenText }, accessToken))),
            isItemAccess && (react_1["default"].createElement("p", { className: index_module_scss_1["default"].requests }, "Now that you have an access_token, you can make all of the following requests:"))))));
};
Header.displayName = "Header";
exports["default"] = Header;
