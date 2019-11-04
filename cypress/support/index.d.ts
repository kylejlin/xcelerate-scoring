/// <reference types="Cypress" />

declare namespace Cypress {
  interface cy {
    task(_: "getToken", token: string): Chainable;
  }
}
