export type AuthCredentials = {
  email: string;
  password: string;
};

export type DocsSideBarItem = {
  id: string;
  sortIndex: number;
  title: string
};

export type DocItem = DocsSideBarItem &{
  content:string
};
