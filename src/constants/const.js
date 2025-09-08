// Centralized user-facing constants
export const AUTH = {
  TITLES: {
    LOGIN: 'Sign in to PocketPay',
    SIGNUP: 'Create your account'
  },
  BUTTONS: {
    SIGN_IN: 'Sign in',
    SIGN_UP: 'Sign up',
    CREATE_ACCOUNT: 'Create account',
    SIGN_IN_SMALL: 'Sign in',
    SIGN_UP_SMALL: 'Sign up',
    LOGOUT: 'Logout'
  },
  PROMPTS: {
    DONT_HAVE_ACCOUNT: "Don't have an account?",
    ALREADY_HAVE: 'Already have an account?'
  },
  ERRORS: {
    INVALID_PASSWORD: 'Invalid password',
    AUTH_INVALID: 'Invalid credentials, try to login again',
    EMAIL_EXISTS: 'Email already exists'
  }
};

export const VALIDATION = {
  NAME_REQUIRED: 'Name is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_REQUIRED: 'Password is required',
};

export const JEWELRY = {
  PLACEHOLDERS: {
    NAME: 'Name',
    KARAT: 'Karat',
    VALUE: 'Value'
  },
  ACTIONS: {
    ADD: '+ Add',
    SAVE: 'Save',
    CANCEL: 'Cancel',
    EDIT: 'Edit',
    DELETE: 'Delete',
    ADD_BUTTON: 'Add'
  }
};

export const UI = {
  PLACEHOLDERS: {
    FULL_NAME: 'Full name',
    EMAIL: 'you@company.com',
    PASSWORD: 'Choose a secure password',
    PASSWORD_DOTS: '••••••••'
  },
  TITLES: {
    WELCOME: 'Welcome',
    WALLET_BALANCE: 'Wallet Balance',
    JEWELRY_ITEMS: 'Jewelry Items',
    RECENT_TRANSACTIONS: 'Recent Transactions',
    YOUR_JEWELRY: 'Your Jewelry',
    ACCOUNT: 'Account',
    YOUR_ITEMS: 'Your items'
  }
};

export default { AUTH, VALIDATION, JEWELRY };
