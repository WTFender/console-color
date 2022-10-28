interface Account {
  accountId: string; // aws account id
  label: string; // console label
  color: string; // console color
}

type AccountList = Account[];

interface Config {
  accounts: AccountList;
  colorDefault: string; // default color for all consoles
  colorFooter: boolean; // color the console footer
  colorHeader: boolean; // color the console header
  labelFooter: boolean; // label the console footer
  labelHeader: boolean; // label the console header
  lastAccountId: string;// last used aws account; populates the menu
}

interface Message {
  level: 'info' | 'help' | 'error';
  text: string;
  time: number
}