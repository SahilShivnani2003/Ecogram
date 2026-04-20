import { InvestorDrawerParamList } from "./InvestorDrawerParamList";

export type DrawerItem = {
  name: keyof InvestorDrawerParamList;
  label: string;
  iconName: string;           
  iconLibrary?: 'ionicons' | 'material' | 'feather';  
};