import assert from "node:assert/strict";
import test from "node:test";

import { drinkMenus } from "./menu-data.js";

test("the alcoholic menu preserves the requested sections and drink order", () => {
  assert.deepEqual(
    drinkMenus.alcoholic.sections.map((section) => section.title),
    ["Cocktails", "Classics"],
  );
  assert.deepEqual(
    drinkMenus.alcoholic.sections.flatMap((section) =>
      section.drinks.map((drink) => drink.name),
    ),
    [
      "Margarita",
      "Mojito",
      "Espresso Martini",
      "Negroni",
      "Paper Plane",
      "Bee’s Knees",
      "Strawberry Bourbon Smash",
      "Gin & Tonic",
      "Rum & Coke",
      "Beer",
    ],
  );
});

test("the non-alcoholic menu preserves the requested sections and drink order", () => {
  assert.deepEqual(
    drinkMenus.nonAlcoholic.sections.map((section) => section.title),
    ["Mocktails", "Soft Drinks"],
  );
  assert.deepEqual(
    drinkMenus.nonAlcoholic.sections.flatMap((section) =>
      section.drinks.map((drink) => drink.name),
    ),
    [
      "Soberita",
      "Nojito",
      "Berry Mint Fizz",
      "Lavender Fields",
      "Sparkling Water",
      "Coke",
      "Sprite",
      "Fanta",
      "Ginger Beer",
    ],
  );
});

test("every featured drink has a short description", () => {
  const drinks = Object.values(drinkMenus).flatMap((menu) =>
    menu.sections.flatMap((section) => section.drinks),
  );
  const describedDrinks = drinks.filter((drink) => drink.description);

  assert.equal(drinks.length, 19);
  assert.equal(describedDrinks.length, 14);
  assert.ok(describedDrinks.every((drink) => drink.description.length < 60));
});

test("non-alcoholic soft drinks omit flavor descriptions", () => {
  const softDrinks = drinkMenus.nonAlcoholic.sections.find(
    (section) => section.title === "Soft Drinks",
  );

  assert.ok(softDrinks.drinks.every((drink) => !drink.description));
});
