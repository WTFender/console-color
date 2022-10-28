function getAccountId(cfg) {
    let accountMenu = document.getElementById('menu--account');
    let accountId = accountMenu
        .firstElementChild
        .firstElementChild
        .firstElementChild
        .getElementsByTagName('span')[1]
        .textContent
        .replaceAll('-', '');
    cfg.lastAccountId = accountId;
    chrome.storage.sync.set({
        config: JSON.stringify(cfg)
    });
    return accountId;
}
function updateConsole(cfg) {
    let accountId = getAccountId(cfg);
    let header = Array.from(document.getElementsByTagName('nav'))[0];
    let headerLabel = (header
        .firstElementChild
        .firstElementChild
        .firstElementChild
        .lastElementChild
        .firstElementChild
        .firstElementChild
        .lastElementChild);
    let footer = document.getElementById('console-nav-footer-inner');
    let footerLabel = (footer
        .firstElementChild
        .firstElementChild
        .firstElementChild
        .firstElementChild);
    // change the header and footer colors
    header.style.backgroundColor = cfg.colorDefault;
    headerLabel.textContent = "Services"; // default console value
    footer.style.backgroundColor = cfg.colorDefault;
    footerLabel.textContent = "Feedback"; // default console value
    for (let a in cfg.accounts) {
        if (accountId == cfg.accounts[a].accountId) {
            if (cfg.colorFooter) {
                footer.style.backgroundColor = cfg.accounts[a].color;
            }
            if (cfg.colorHeader) {
                header.style.backgroundColor = cfg.accounts[a].color;
            }
            if (cfg.labelFooter) {
                footerLabel.textContent = cfg.accounts[a].label;
            }
            if (cfg.labelHeader) {
                headerLabel.textContent = cfg.accounts[a].label;
            }
        }
    }
}
function colorConsole() {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        colorConsole();
    });
    chrome.storage.sync.get(['config'], function (data) {
        if (data.config) {
            let cfg = JSON.parse(data.config);
            updateConsole(cfg);
        }
        else {
            console.log('error loading config');
        }
    });
}
if (window.location.hostname.endsWith('console.aws.amazon.com')) {
    colorConsole(); // color the browser
}
const rexAccountId = new RegExp("^\\d{12}$"); // aws account id
const defaultConfig = {
    accounts: [],
    colorDefault: "#232f3e",
    colorFooter: true,
    colorHeader: true,
    labelFooter: true,
    labelHeader: true,
    lastAccountId: ""
};
var config = defaultConfig;
var messageTimer;
function saveConfig(cfg) {
    chrome.storage.sync.set({
        config: JSON.stringify(cfg)
    });
    config = cfg;
}
function saveAccounts(accounts) {
    let colorDefault = document.getElementById("colorDefault");
    let colorFooter = document.getElementById("colorFooter");
    let colorHeader = document.getElementById("colorHeader");
    let labelFooter = document.getElementById("labelFooter");
    let labelHeader = document.getElementById("labelHeader");
    let cfg = {
        accounts: accounts,
        colorDefault: colorDefault.value,
        colorFooter: colorFooter.checked,
        colorHeader: colorHeader.checked,
        labelFooter: labelFooter.checked,
        labelHeader: labelHeader.checked,
        lastAccountId: config.lastAccountId
    };
    saveConfig(cfg);
}
function saveAccountColor(accountId, color) {
    var accounts = config.accounts;
    for (let acct in accounts) {
        if (accounts[acct].accountId === accountId) {
            accounts[acct].color = color;
        }
    }
    saveAccounts(accounts);
}
function loadConfig() {
    chrome.storage.sync.get(['config'], function (data) {
        try {
            if (data.config) {
                let cfg = JSON.parse(data.config);
                showConfig(cfg);
                console.log('config loaded');
            }
            else {
                showConfig(defaultConfig);
                console.log('default config loaded');
            }
        }
        catch (err) {
            console.log(err);
            showMsg({ level: 'error', text: 'Error - default config loaded', time: 5000 });
            showConfig(defaultConfig);
        }
    });
}
function buildAccountRow(account) {
    // remove button
    let rmBtnCell = document.createElement('td');
    let rmBtn = document.createElement('button');
    rmBtn.setAttribute('title', 'Remove Account');
    rmBtn.setAttribute('title', 'Remove Account');
    let icon = document.createElement('i');
    icon.className = 'fa fa-minus';
    rmBtn.appendChild(icon);
    rmBtn.addEventListener('click', function (event) {
        rmAccount(account.accountId);
    });
    rmBtnCell.appendChild(rmBtn);
    // color picker
    let colorCell = document.createElement('td');
    let color = document.createElement('input');
    color.setAttribute('type', 'color');
    color.value = account.color;
    color.addEventListener('change', function (event) {
        let newColor = event.target.value;
        saveAccountColor(account.accountId, newColor);
    });
    colorCell.append(color);
    // account id
    let accountCell = document.createElement('td');
    let acctId = document.createElement('input');
    acctId.setAttribute('type', 'text');
    acctId.setAttribute('size', '13');
    acctId.setAttribute('placeholder', account.accountId);
    acctId.setAttribute('disabled', '');
    accountCell.appendChild(acctId);
    // label
    let labelCell = document.createElement('td');
    let label = document.createElement('input');
    label.setAttribute('type', 'text');
    label.setAttribute('size', '13');
    label.setAttribute('placeholder', account.label);
    labelCell.appendChild(label);
    // create row
    let row = document.createElement('tr');
    row.appendChild(rmBtnCell);
    row.appendChild(colorCell);
    row.appendChild(accountCell);
    row.appendChild(labelCell);
    return row;
}
function buildAccountTable(cfg) {
    let accountList = document.getElementById('accountList');
    accountList.innerHTML = ''; // reset accounts
    for (var a in cfg.accounts) {
        let row = buildAccountRow(cfg.accounts[a]);
        accountList.appendChild(row);
    }
}
function showConfig(cfg) {
    config = cfg;
    document.getElementById('json').value = JSON.stringify(cfg, null, 4);
    document.getElementById("colorDefault").value = cfg.colorDefault;
    document.getElementById("colorFooter").checked = cfg.colorFooter;
    document.getElementById("colorHeader").checked = cfg.colorHeader;
    document.getElementById("labelFooter").checked = cfg.labelFooter;
    document.getElementById("labelHeader").checked = cfg.labelHeader;
    if (cfg.lastAccountId && !findAccount(cfg.lastAccountId, cfg.accounts)) {
        document.getElementById("addAccountId").value = cfg.lastAccountId;
    }
    buildAccountTable(cfg);
}
function showMsg(msg) {
    clearTimeout(messageTimer);
    let message = document.getElementById('message');
    message.className = msg.level;
    message.innerHTML = `${msg.text}`;
    message.style.display = 'block';
    messageTimer = setTimeout(function () {
        message.style.display = 'none';
    }, msg.time);
}
function findAccount(accountId, accounts) {
    for (var acct in accounts) {
        if (accounts[acct].accountId == accountId) {
            return true;
        }
    }
    return false;
}
function rmAccount(accountId) {
    let newAccounts = [];
    for (var acct in config.accounts) {
        if (config.accounts[acct].accountId != accountId) {
            newAccounts.push(config.accounts[acct]);
        }
    }
    saveAccounts(newAccounts);
}
function addAccount(acct) {
    if (findAccount(acct.accountId, config.accounts)) {
        let msg = { level: 'error', text: 'Account ID already exists.', time: 5000 };
        showMsg(msg);
    }
    else if (!rexAccountId.test(acct.accountId)) {
        let msg = { level: 'error', text: 'Bad Account Id (12 digit number expected).', time: 5000 };
        showMsg(msg);
    }
    else {
        config.accounts.push(acct);
        saveAccounts(config.accounts);
        // reset add account fields
        document.getElementById('addAccountId').value = '';
        document.getElementById('addLabel').value = '';
    }
}
function menu() {
    document.addEventListener('DOMContentLoaded', function () {
        loadConfig();
        // refresh config
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            loadConfig();
        });
        // reset config
        document.getElementById('btnReset').addEventListener("click", function (event) {
            chrome.storage.sync.set({
                config: JSON.stringify(defaultConfig)
            });
            showConfig(defaultConfig);
            console.log('config reset');
        });
        // add account
        document.getElementById('addBtn').addEventListener("click", function (event) {
            addAccount({
                accountId: document.getElementById('addAccountId').value,
                color: document.getElementById('addColor').value,
                label: document.getElementById('addLabel').value
            });
        });
        let optionBtns = ["colorDefault", "colorFooter", "colorHeader", "labelFooter", "labelHeader"];
        for (let btn in optionBtns) {
            document.getElementById(optionBtns[btn]).addEventListener("change", function (event) {
                saveAccounts(config.accounts);
            });
        }
        let btnAccounts = document.getElementById('btnAccounts');
        let btnOptions = document.getElementById('btnOptions');
        let btnConfig = document.getElementById('btnConfig');
        let btnSave = document.getElementById('btnSave');
        let btnExit = document.getElementById('exitBtn');
        let cfg = document.getElementById('config');
        let options = document.getElementById('options');
        let accounts = document.getElementById('accounts');
        // show accounts
        btnAccounts.addEventListener("click", function (event) {
            btnAccounts.classList.add("active");
            btnConfig.classList.remove("active");
            btnOptions.classList.remove("active");
            if (accounts.style.display !== "block") {
                accounts.style.display = "block";
                cfg.style.display = "none";
                options.style.display = "none";
            }
        });
        // show options
        btnOptions.addEventListener("click", function (event) {
            btnOptions.classList.add("active");
            btnConfig.classList.remove("active");
            btnAccounts.classList.remove("active");
            if (options.style.display !== "block") {
                options.style.display = "block";
                accounts.style.display = "none";
                cfg.style.display = "none";
            }
        });
        // show config
        btnConfig.addEventListener("click", function (event) {
            btnConfig.classList.add("active");
            btnAccounts.classList.remove("active");
            btnOptions.classList.remove("active");
            if (cfg.style.display !== "block") {
                cfg.style.display = "block";
                accounts.style.display = "none";
                options.style.display = "none";
            }
        });
        btnSave.addEventListener("click", function (event) {
            try {
                let cfg = JSON.parse(document.getElementById('json').value);
                var hasRequiredkeys = Object.keys(defaultConfig).every(function (key) {
                    return Object.prototype.hasOwnProperty.call(cfg, key);
                });
                if (hasRequiredkeys) {
                    saveConfig(cfg);
                }
                else {
                    showMsg({ level: 'error', text: 'Error saving - missing required keys.', time: 3000 });
                }
            }
            catch (err) {
                console.log(err);
                showMsg({ level: 'error', text: 'Error saving; invalid json.', time: 3000 });
            }
        });
        // exit
        btnExit.addEventListener("click", function (event) {
            window.close();
        });
    });
}
if (!window.location.hostname.endsWith('console.aws.amazon.com')) {
    menu(); // show the menu
}
