function getAccountId(cfg: Config): string {
  let accountMenu = document.getElementById('menu--account');
  let accountId = accountMenu
    .firstElementChild
    .firstElementChild
    .firstElementChild
    .getElementsByTagName('span')[1]
    .textContent
    .replaceAll('-', '');
  cfg.lastAccountId = accountId
  chrome.storage.sync.set({
    config: JSON.stringify(cfg)
  });
  return accountId
}

function updateConsole(cfg: Config) {
  let accountId = getAccountId(cfg)
  let header = Array.from(document.getElementsByTagName('nav') as HTMLCollectionOf<HTMLElement>)[0]
  let headerLabel = (header
    .firstElementChild
    .firstElementChild
    .firstElementChild
    .lastElementChild
    .firstElementChild
    .firstElementChild
    .lastElementChild)
  let footer = document.getElementById('console-nav-footer-inner')
  let footerLabel = (footer
    .firstElementChild
    .firstElementChild
    .firstElementChild
    .firstElementChild)
  // change the header and footer colors
  header.style.backgroundColor = cfg.colorDefault
  headerLabel.textContent = "Services"; // default console value
  footer.style.backgroundColor = cfg.colorDefault
  footerLabel.textContent = "Feedback"; // default console value
  for (let a in cfg.accounts) {
    if (accountId == cfg.accounts[a].accountId) {
      if (cfg.colorFooter) { footer.style.backgroundColor = cfg.accounts[a].color }
      if (cfg.colorHeader) { header.style.backgroundColor = cfg.accounts[a].color }
      if (cfg.labelFooter) { footerLabel.textContent = cfg.accounts[a].label }
      if (cfg.labelHeader) { headerLabel.textContent = cfg.accounts[a].label }
    }
  }

}

function colorConsole() {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    colorConsole()
  });
  chrome.storage.sync.get(['config'], function (data) {
    if (data.config) {
      let cfg: Config = JSON.parse(data.config)
      updateConsole(cfg)
    } else {
      console.log('error loading config')
    }
  })
}

if (window.location.hostname.endsWith('console.aws.amazon.com')) {
  colorConsole() // color the browser
}
