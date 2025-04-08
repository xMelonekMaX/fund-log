import { ICategoryLocal } from "@/models/Category";
import { LOCAL_STORAGE_KEYS } from "./constants";
import { v4 as uuidv4 } from "uuid";
import { IExpenseLocal } from "@/models/Expense";
import { localDb } from "./indexedDb";

export function initializeDemoMode() {
  setDemoData();
  localStorage.setItem(LOCAL_STORAGE_KEYS.IS_DEMO, "true");
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_ID);
}

export function isDemoMode() {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.IS_DEMO) === "true";
}

export function exitDemoMode() {
  localStorage.setItem(LOCAL_STORAGE_KEYS.IS_DEMO, "false");
  localDb.delete({ disableAutoOpen: false });
}

function setDemoData() {
  localDb.delete({ disableAutoOpen: false });

  const now = new Date();

  // Phone Carrier IDs
  const phoneCarrierId = uuidv4();
  const mobileVikingsId = uuidv4();
  const orangeId = uuidv4();

  // Books ID
  const booksId = uuidv4();

  // Clothes IDs
  const clothesId = uuidv4();
  const topsId = uuidv4();
  const footwearId = uuidv4();
  const outerwearId = uuidv4();
  const underwearId = uuidv4();

  // Food & Drinks IDs
  const foodAndDrinksId = uuidv4();
  const restaurantsId = uuidv4();
  const mcdonaldsId = uuidv4();
  const kfcId = uuidv4();
  const homeCookingId = uuidv4();

  // Parties ID
  const partiesId = uuidv4();

  // Transport IDs
  const transportId = uuidv4();
  const friendsCarsId = uuidv4();
  const publicTransportId = uuidv4();
  const flightsId = uuidv4();
  const myCarId = uuidv4();

  // Other ID
  const otherId = uuidv4();

  const categories: ICategoryLocal[] = [
    {
      _id: phoneCarrierId,
      name: "Phone Carrier",
      icon: "PHONE",
      color: "#66686b",
      subcategories: [
        { _id: mobileVikingsId, name: "Mobile Vikings" },
        { _id: orangeId, name: "Orange" },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: booksId,
      name: "Books",
      icon: "OPENED_BOOK",
      color: "#5e3a0c",
      subcategories: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: clothesId,
      name: "Clothes",
      icon: "SHIRT",
      color: "#361a47",
      subcategories: [
        { _id: topsId, name: "Tops" },
        { _id: footwearId, name: "Footwear" },
        { _id: outerwearId, name: "Outerwear" },
        { _id: underwearId, name: "Underwear" },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: foodAndDrinksId,
      name: "Food & Drinks",
      icon: "FAST_FOOD",
      color: "#d2ba2b",
      subcategories: [
        { _id: restaurantsId, name: "Restaurants" },
        { _id: mcdonaldsId, name: "McDonald's" },
        { _id: kfcId, name: "KFC" },
        { _id: homeCookingId, name: "Home Cooking" },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: partiesId,
      name: "Parties",
      icon: "BALLOON",
      color: "#762859",
      subcategories: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: transportId,
      name: "Transport",
      icon: "CAR",
      color: "#416685",
      subcategories: [
        { _id: friendsCarsId, name: "Friends' Cars" },
        { _id: publicTransportId, name: "Public Transport" },
        { _id: flightsId, name: "Flights" },
        { _id: myCarId, name: "My Car" },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: otherId,
      name: "Other",
      icon: "CIRCLE",
      color: "#b82837",
      subcategories: [],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const expenses: IExpenseLocal[] = [
    {
      _id: uuidv4(),
      categoryId: foodAndDrinksId,
      subcategoryId: homeCookingId,
      amount: 245.67,
      currency: "PLN",
      description: "Weekly groceries Biedronka",
      date: new Date("2024-12-05"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: clothesId,
      subcategoryId: outerwearId,
      amount: 89.99,
      currency: "USD",
      description: "Winter jacket",
      date: new Date("2024-12-10"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: transportId,
      subcategoryId: publicTransportId,
      description: "",
      amount: 25.0,
      currency: "PLN",
      date: new Date("2024-12-15"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: phoneCarrierId,
      subcategoryId: mobileVikingsId,
      amount: 30.0,
      currency: "PLN",
      description: "Monthly subscription",
      date: new Date("2024-12-20"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: foodAndDrinksId,
      subcategoryId: mcdonaldsId,
      description: "",
      amount: 15.99,
      currency: "USD",
      date: new Date("2025-01-05"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: clothesId,
      subcategoryId: footwearId,
      amount: 120.0,
      currency: "USD",
      description: "Nike sneakers",
      date: new Date("2025-01-12"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: partiesId,
      amount: 75.0,
      currency: "USD",
      description: "Birthday party supplies",
      date: new Date("2025-01-18"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: transportId,
      subcategoryId: flightsId,
      amount: 299.99,
      currency: "USD",
      description: "Flight to London",
      date: new Date("2025-03-01"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: booksId,
      amount: 29.99,
      currency: "USD",
      description: "Programming book",
      date: new Date("2025-03-05"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: foodAndDrinksId,
      subcategoryId: restaurantsId,
      amount: 89.99,
      currency: "PLN",
      description: "Italian restaurant",
      date: new Date("2025-03-10"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: otherId,
      amount: 45.0,
      currency: "USD",
      description: "Gift for mom",
      date: new Date("2025-03-15"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: clothesId,
      subcategoryId: topsId,
      description: "",
      amount: 35.99,
      currency: "USD",
      date: new Date("2025-03-20"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: transportId,
      subcategoryId: myCarId,
      amount: 50.0,
      currency: "USD",
      description: "Gas refill",
      date: new Date("2025-03-25"),
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      categoryId: foodAndDrinksId,
      subcategoryId: kfcId,
      description: "",
      amount: 12.99,
      currency: "USD",
      date: new Date("2025-03-30"),
      createdAt: now,
      updatedAt: now,
    },
  ];

  localDb.categories.bulkAdd(categories);
  localDb.expenses.bulkAdd(expenses);
}
