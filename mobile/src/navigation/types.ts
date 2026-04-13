import type { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// Onboarding Stack
export type OnboardingStackParamList = {
  Onboarding: undefined;
};

// Dashboard Stack
export type DashboardStackParamList = {
  DashboardHome: undefined;
  RegulationDetail: { regulationId: string };
};

// Document Stack
export type DocumentStackParamList = {
  DocumentList: undefined;
  NewDocument: undefined;
  DocumentDetail: { documentId: string };
};

// Regulation Stack
export type RegulationStackParamList = {
  RegulationList: undefined;
  RegulationDetail: { regulationId: string };
};

// More Stack
export type MoreStackParamList = {
  MoreMenu: undefined;
  Profile: undefined;
  Settings: undefined;
  PasswordChange: undefined;
  NotificationPrefs: undefined;
  Billing: undefined;
  ClientList: undefined;
  ClientForm: { clientId?: string } | undefined;
  ProjectList: undefined;
  ProjectForm: { projectId?: string } | undefined;
  CECreditList: undefined;
  CECreditForm: { creditId?: string } | undefined;
  ExpenseList: undefined;
  ExpenseForm: { expenseId?: string } | undefined;
  TeamList: undefined;
  ComplianceLog: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Documents: NavigatorScreenParams<DocumentStackParamList>;
  Regulations: NavigatorScreenParams<RegulationStackParamList>;
  More: NavigatorScreenParams<MoreStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
